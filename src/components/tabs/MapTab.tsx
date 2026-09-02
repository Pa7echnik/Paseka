import { useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useLibrary } from "../../lib/store";
import type { LocType, Location } from "../../lib/types";
import { LOC_TYPES } from "../../lib/types";
import { Icon, PATHS } from "../Icons";
import type { IconName } from "../Icons";
import { Btn, ConfirmBtn, Field, Modal, Reveal, SectionHead } from "../ui";

const TYPE_ICON: Record<LocType, IconName> = {
  city: "tower",
  port: "anchor",
  fortress: "shield",
  ruins: "column",
  village: "house",
  wilds: "mountain",
};

const LAND_PATH =
  "M150,150 C220,105 330,95 410,125 C470,100 560,92 640,120 C720,95 830,120 865,185 C930,215 950,300 910,360 C940,420 900,500 820,520 C790,585 690,610 610,575 C540,615 430,610 370,560 C280,585 180,550 150,480 C85,440 60,360 95,300 C60,240 90,180 150,150 Z";
const ISLE_PATH =
  "M880,470 C905,455 940,465 945,490 C950,515 920,535 895,525 C870,515 860,485 880,470 Z";

const TREES: [number, number][] = [
  [600, 332], [622, 344], [645, 330], [666, 346], [612, 360], [638, 364],
  [660, 374], [686, 356], [630, 382], [678, 338], [700, 370], [615, 377],
  [650, 390], [690, 384],
];

function MapGlyph({ name, size = 17, sw = 1.7 }: { name: IconName; size?: number; sw?: number }) {
  return (
    <svg
      x={-size / 2}
      y={-size / 2}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name]}
    </svg>
  );
}

interface Draft {
  name: string;
  type: LocType;
  description: string;
}
const emptyDraft: Draft = { name: "", type: "city", description: "" };

export function MapTab() {
  const lib = useLibrary();
  const { locations, party } = lib;

  const [selectedId, setSelectedId] = useState<string | null>(party.locationId);
  const [addMode, setAddMode] = useState(false);
  const [modal, setModal] = useState<
    null | { mode: "new"; x: number; y: number } | { mode: "edit"; loc: Location }
  >(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const svgRef = useRef<SVGSVGElement>(null);

  const byId = useMemo(() => new Map(locations.map((l) => [l.id, l])), [locations]);
  const routeLocs = party.route.map((id) => byId.get(id)).filter(Boolean) as Location[];
  const current = party.locationId ? byId.get(party.locationId) ?? null : null;
  const selected = selectedId ? byId.get(selectedId) ?? null : null;

  const toSvgPoint = (e: ReactMouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return {
      x: Math.round(Math.min(975, Math.max(25, p.x))),
      y: Math.round(Math.min(615, Math.max(25, p.y))),
    };
  };

  const onMapClick = (e: ReactMouseEvent) => {
    if (!addMode) return;
    const p = toSvgPoint(e);
    if (!p) return;
    setDraft(emptyDraft);
    setModal({ mode: "new", ...p });
  };

  const save = () => {
    if (!draft.name.trim() || !modal) return;
    if (modal.mode === "new") {
      lib.addLocation({
        name: draft.name.trim(),
        type: draft.type,
        x: modal.x,
        y: modal.y,
        description: draft.description.trim(),
      });
    } else {
      lib.updateLocation(modal.loc.id, {
        name: draft.name.trim(),
        type: draft.type,
        description: draft.description.trim(),
      });
    }
    setModal(null);
    setAddMode(false);
  };

  return (
    <div className="tab-in">
      <SectionHead
        eyebrow="Карта известного мира"
        title="Земли Аэлории"
        sub="Отряд движется по сюжету — отмечайте, где герои сейчас, и дорога ляжет на карту сама. Нужно новое место? Включите режим метки и кликните по карте."
        action={
          <div className="flex gap-3">
            <Btn
              variant={addMode ? "gold" : "ghost"}
              onClick={() => setAddMode((v) => !v)}
            >
              <Icon name="pin" className="w-4 h-4" />
              {addMode ? "Кликните по карте…" : "Новая метка"}
            </Btn>
            {party.route.length > 1 && (
              <Btn onClick={() => lib.resetRoute()}>
                <Icon name="route" className="w-4 h-4" /> Сбросить путь
              </Btn>
            )}
          </div>
        }
      />

      <div className="grid xl:grid-cols-[1fr_330px] gap-6 items-start">
        {/* ===== map ===== */}
        <Reveal>
          <div className="panel panel-corner relative overflow-hidden">
            {addMode && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-md border border-gold-500/50 bg-ink-900/90 text-gold-200 text-sm font-medium shadow-lg tab-in">
                Режим метки: кликните туда, где стоит новое место
              </div>
            )}
            <svg
              ref={svgRef}
              viewBox="0 0 1000 640"
              className={`w-full h-auto block select-none ${addMode ? "cursor-crosshair" : ""}`}
              onClick={onMapClick}
              role="img"
              aria-label="Интерактивная карта континента Аэлория"
            >
              <defs>
                <radialGradient id="sea" cx="50%" cy="42%" r="75%">
                  <stop offset="0%" stopColor="#12262a" />
                  <stop offset="100%" stopColor="#0a1518" />
                </radialGradient>
                <linearGradient id="land" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#243a2d" />
                  <stop offset="55%" stopColor="#1b2c22" />
                  <stop offset="100%" stopColor="#16241c" />
                </linearGradient>
                <pattern id="waves" width="90" height="34" patternUnits="userSpaceOnUse">
                  <path
                    d="M0 17 q11 -7 22 0 t22 0 t22 0 t22 0"
                    fill="none"
                    stroke="#7fa3b5"
                    strokeOpacity="0.1"
                    strokeWidth="1.2"
                  />
                </pattern>
              </defs>

              {/* sea */}
              <rect width="1000" height="640" fill="url(#sea)" />
              <rect width="1000" height="640" fill="url(#waves)" />

              {/* graticule */}
              {Array.from({ length: 9 }, (_, i) => (
                <line key={`v${i}`} x1={(i + 1) * 100} y1="0" x2={(i + 1) * 100} y2="640" stroke="#e6dac0" strokeOpacity="0.03" />
              ))}
              {Array.from({ length: 6 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={(i + 1) * 100} x2="1000" y2={(i + 1) * 100} stroke="#e6dac0" strokeOpacity="0.03" />
              ))}

              {/* landmass */}
              <path d={LAND_PATH} fill="url(#land)" stroke="#d4ab5c" strokeOpacity="0.5" strokeWidth="2.5" />
              <path d={LAND_PATH} fill="none" stroke="#d4ab5c" strokeOpacity="0.08" strokeWidth="10" />
              <path d={ISLE_PATH} fill="url(#land)" stroke="#d4ab5c" strokeOpacity="0.5" strokeWidth="2" />

              {/* mountains — Grey Crag */}
              <g fill="none" stroke="#a29a7e" strokeLinecap="round" strokeLinejoin="round">
                <path d="M330,292 L356,246 L382,290 L408,240 L434,288 L460,242 L486,290 L512,250 L538,292" strokeWidth="2.4" strokeOpacity="0.75" />
                <path d="M352,308 L376,268 L400,306 L424,264 L448,304 L472,268 L496,306" strokeWidth="1.6" strokeOpacity="0.4" />
              </g>

              {/* lake */}
              <ellipse cx="500" cy="377" rx="36" ry="19" fill="#12262a" stroke="#7fa3b5" strokeOpacity="0.35" strokeWidth="1.4" />
              <ellipse cx="500" cy="377" rx="24" ry="11" fill="none" stroke="#7fa3b5" strokeOpacity="0.15" strokeWidth="1" />

              {/* river Silverline */}
              <path
                d="M470,310 C490,345 515,355 535,390 C560,430 615,455 660,485 C700,510 736,527 762,538"
                fill="none"
                stroke="#7fa3b5"
                strokeOpacity="0.45"
                strokeWidth="2.4"
                strokeLinecap="round"
              />

              {/* hushwood trees */}
              <g stroke="#5f8f6f" strokeOpacity="0.75" fill="#1b2c22" strokeWidth="1.3" strokeLinejoin="round">
                {TREES.map(([x, y], i) => (
                  <g key={i}>
                    <path d={`M${x - 6},${y} L${x},${y - 12} L${x + 6},${y} Z`} />
                    <path d={`M${x},${y} v4`} fill="none" />
                  </g>
                ))}
              </g>

              {/* water labels */}
              <text x="168" y="78" className="map-water-label" transform="rotate(-4 168 78)">
                СТУДЁНОЕ МОРЕ
              </text>
              <text x="860" y="600" className="map-water-label" style={{ fontSize: 16 }} transform="rotate(-8 860 600)">
                ЗАЛИВ СИРЕН
              </text>

              {/* compass rose */}
              <g transform="translate(905,92)" stroke="#d4ab5c" fill="none" opacity="0.6">
                <circle r="46" strokeWidth="1" />
                <circle r="38" strokeWidth="0.6" strokeDasharray="2 5" />
                <path d="M0,-44 L7,-7 L44,0 L7,7 L0,44 L-7,7 L-44,0 L-7,-7 Z" strokeWidth="1.2" />
                <path d="M0,-26 L4,-4 L26,0 L4,4 L0,26 L-4,4 L-26,0 L-4,-4 Z" strokeWidth="0.8" opacity="0.7" transform="rotate(45)" />
                <circle r="4" fill="#d4ab5c" stroke="none" />
                <text y="-52" textAnchor="middle" fill="#d4ab5c" stroke="none" style={{ font: "600 15px Cormorant, serif" }}>
                  С
                </text>
              </g>

              {/* cartouche */}
              <g transform="translate(52,540)">
                <rect width="262" height="66" rx="4" fill="#101a16" fillOpacity="0.88" stroke="#d4ab5c" strokeOpacity="0.45" strokeWidth="1.4" />
                <rect x="5" y="5" width="252" height="56" rx="2" fill="none" stroke="#d4ab5c" strokeOpacity="0.2" strokeWidth="0.8" />
                <text x="131" y="31" textAnchor="middle" fill="#e3c27d" style={{ font: "italic 600 22px Cormorant, serif", letterSpacing: "0.08em" }}>
                  Земли Аэлории
                </text>
                <text x="131" y="50" textAnchor="middle" fill="#a29a7e" style={{ font: "10px 'IBM Plex Mono', monospace", letterSpacing: "0.22em" }}>
                  КАРТА ИЗВЕСТНОГО МИРА
                </text>
              </g>

              {/* scale bar */}
              <g transform="translate(790,612)" stroke="#a29a7e" strokeWidth="1.4">
                <line x1="0" y1="0" x2="120" y2="0" />
                <line x1="0" y1="-5" x2="0" y2="5" />
                <line x1="60" y1="-4" x2="60" y2="4" />
                <line x1="120" y1="-5" x2="120" y2="5" />
                <text x="60" y="-10" textAnchor="middle" fill="#a29a7e" stroke="none" style={{ font: "10px 'IBM Plex Mono', monospace", letterSpacing: "0.15em" }}>
                  100 ВЁРСТ
                </text>
              </g>

              {/* frame */}
              <rect x="8" y="8" width="984" height="624" fill="none" stroke="#d4ab5c" strokeOpacity="0.28" strokeWidth="1.6" rx="3" />
              <rect x="16" y="16" width="968" height="608" fill="none" stroke="#d4ab5c" strokeOpacity="0.12" strokeWidth="0.8" rx="2" />

              {/* route */}
              {routeLocs.length > 1 && (
                <polyline
                  points={routeLocs.map((l) => `${l.x},${l.y}`).join(" ")}
                  fill="none"
                  stroke="#e3c27d"
                  strokeOpacity="0.85"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="route-line"
                />
              )}
              {routeLocs.slice(0, -1).map((l) => (
                <circle key={`wp-${l.id}`} cx={l.x} cy={l.y} r="3.4" fill="#e3c27d" fillOpacity="0.9" />
              ))}

              {/* location markers */}
              {locations.map((l) => {
                const isSel = selectedId === l.id;
                const isHere = party.locationId === l.id;
                return (
                  <g
                    key={l.id}
                    transform={`translate(${l.x},${l.y})`}
                    className="marker"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(l.id);
                    }}
                  >
                    {isSel && (
                      <circle
                        r="22"
                        fill="none"
                        stroke="#e3c27d"
                        strokeOpacity="0.8"
                        strokeWidth="1.2"
                        strokeDasharray="4 6"
                        className="anim-spin-slow"
                        style={{ transformBox: "fill-box", transformOrigin: "center" }}
                      />
                    )}
                    <circle
                      r="14"
                      fill={isHere ? "#1d2b25" : "#101a16"}
                      fillOpacity="0.95"
                      stroke={isHere ? "#e3c27d" : "#d4ab5c"}
                      strokeOpacity={isHere ? 1 : 0.6}
                      strokeWidth="1.6"
                    />
                    <g color={isHere ? "#e3c27d" : "#cfc2a2"}>
                      <MapGlyph name={TYPE_ICON[l.type]} />
                    </g>
                    <text y="30" className="map-label" style={isHere ? { fill: "#e3c27d" } : undefined}>
                      {l.name}
                    </text>
                  </g>
                );
              })}

              {/* party marker */}
              {current && (
                <g transform={`translate(${current.x},${current.y - 26})`} style={{ pointerEvents: "none" }}>
                  <circle r="9" fill="#c0603e" fillOpacity="0.35" className="party-ripple" />
                  <circle r="9" fill="#d4ab5c" fillOpacity="0.3" className="party-ripple" style={{ animationDelay: "1.2s" }} />
                  <circle r="9.5" fill="#16231d" stroke="#e3c27d" strokeWidth="1.5" />
                  <g color="#e3c27d">
                    <MapGlyph name="star" size={12} sw={2} />
                  </g>
                  <path d="M9.5,0 L22,-7 L22,7 Z" fill="#c0603e" stroke="#e3c27d" strokeWidth="0.8" />
                </g>
              )}
            </svg>
          </div>

          {/* legend */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 px-2">
            {LOC_TYPES.map((t) => (
              <span key={t.id} className="inline-flex items-center gap-2 text-sm text-parch-400">
                <Icon name={TYPE_ICON[t.id]} className="w-4 h-4 text-gold-400/80" /> {t.label}
              </span>
            ))}
            <span className="inline-flex items-center gap-2 text-sm text-parch-400 ml-auto">
              <span className="relative flex w-3 h-3">
                <span className="absolute inline-flex w-full h-full rounded-full bg-ember-500/60 party-ripple" />
                <span className="relative inline-flex w-3 h-3 rounded-full bg-gold-400" />
              </span>
              отряд героев
            </span>
          </div>
        </Reveal>

        {/* ===== sidebar ===== */}
        <div className="space-y-5 xl:sticky xl:top-24">
          {/* party */}
          <Reveal delay={100}>
            <div className="panel px-5 py-5">
              <div className="flex items-center gap-2.5 mb-4">
                <Icon name="star" className="w-4 h-4 text-gold-300" />
                <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-parch-400">
                  Отряд по сюжету
                </span>
              </div>
              {current ? (
                <>
                  <p className="font-display text-2xl font-semibold text-parch-100 leading-tight mb-1">
                    {current.name}
                  </p>
                  <p className="text-sm text-parch-400 mb-4">
                    {LOC_TYPES.find((t) => t.id === current.type)?.label} · герои сейчас здесь
                  </p>
                </>
              ) : (
                <p className="text-sm text-parch-400 mb-4 italic">Отряд в пути — отметьте точку на карте.</p>
              )}

              {routeLocs.length > 0 && (
                <div className="border-t border-line/60 pt-4">
                  <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-parch-400 mb-3">
                    Пройденный путь
                  </p>
                  <div className="flex flex-wrap items-center gap-y-2">
                    {routeLocs.map((l, i) => (
                      <span key={l.id} className="flex items-center">
                        {i > 0 && <Icon name="arrow" className="w-3.5 h-3.5 text-gold-500/60 mx-1.5" />}
                        <button
                          onClick={() => setSelectedId(l.id)}
                          className={`px-2.5 py-1 rounded-full border text-[13px] transition-colors ${
                            i === routeLocs.length - 1
                              ? "border-gold-500/60 bg-gold-500/15 text-gold-200"
                              : "border-line text-parch-300 hover:border-fog-500/50"
                          }`}
                        >
                          {l.name}
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Reveal>

          {/* selected location */}
          <Reveal delay={180}>
            <div className="panel panel-corner px-5 py-5">
              <div className="flex items-center gap-2.5 mb-3">
                <Icon name="compass" className="w-4 h-4 text-fog-300" />
                <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-parch-400">
                  Выбранная метка
                </span>
              </div>
              {selected ? (
                <>
                  <div className="flex items-start gap-3 mb-3">
                    <span className="w-10 h-10 rounded-full border border-gold-500/40 bg-ink-900 flex items-center justify-center shrink-0">
                      <Icon name={TYPE_ICON[selected.type]} className="w-5 h-5 text-gold-300" />
                    </span>
                    <div>
                      <p className="font-display text-xl font-semibold text-parch-100 leading-tight">
                        {selected.name}
                      </p>
                      <p className="font-mono text-[10px] tracking-wider uppercase text-parch-400 mt-1">
                        {LOC_TYPES.find((t) => t.id === selected.type)?.label} · {selected.x},{selected.y}
                      </p>
                    </div>
                  </div>
                  <p className="font-read text-[0.95rem] leading-relaxed text-parch-200/90 mb-4">
                    {selected.description || "Описание ещё не записано."}
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {party.locationId !== selected.id && (
                      <Btn variant="gold" onClick={() => lib.moveParty(selected.id)} className="flex-1 justify-center">
                        <Icon name="star" className="w-4 h-4" /> Отряд сюда
                      </Btn>
                    )}
                    <Btn
                      onClick={() => {
                        setDraft({ name: selected.name, type: selected.type, description: selected.description });
                        setModal({ mode: "edit", loc: selected });
                      }}
                    >
                      <Icon name="edit" className="w-4 h-4" />
                    </Btn>
                    <ConfirmBtn
                      onConfirm={() => {
                        lib.deleteLocation(selected.id);
                        setSelectedId(null);
                      }}
                      label={<span className="text-sm px-1">Убрать</span>}
                      className="border border-line rounded-md px-2.5"
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm text-parch-400 italic">
                  Кликните по метке на карте, чтобы узнать о месте и отправить туда отряд.
                </p>
              )}
            </div>
          </Reveal>

          {/* all locations */}
          <Reveal delay={260}>
            <div className="panel overflow-hidden">
              <div className="px-5 py-3 border-b border-line/70 flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-parch-400">
                  Все места
                </span>
                <span className="font-mono text-[11px] text-gold-400">{locations.length}</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {locations.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedId(l.id)}
                    className={`w-full flex items-center gap-3 px-5 py-2.5 text-left text-sm border-b border-line/40 last:border-b-0 transition-colors ${
                      selectedId === l.id ? "bg-gold-500/10 text-gold-200" : "text-parch-300 hover:bg-ink-700/50"
                    }`}
                  >
                    <Icon name={TYPE_ICON[l.type]} className="w-4 h-4 shrink-0 text-gold-400/70" />
                    <span className="truncate">{l.name}</span>
                    {party.locationId === l.id && (
                      <Icon name="star" className="w-3.5 h-3.5 ml-auto text-ember-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ===== add / edit modal ===== */}
      <Modal
        open={modal !== null}
        onClose={() => {
          setModal(null);
          setAddMode(false);
        }}
        title={modal?.mode === "edit" ? "Правка метки" : "Новое место на карте"}
      >
        {modal?.mode === "new" && (
          <p className="font-mono text-[11px] text-fog-300 mb-4 tracking-wider">
            Координаты: {modal.x}, {modal.y}
          </p>
        )}
        <Field label="Название">
          <input
            className="field"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Лунный порт"
            autoFocus
          />
        </Field>
        <Field label="Тип места">
          <div className="grid grid-cols-3 gap-2">
            {LOC_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setDraft({ ...draft, type: t.id })}
                className={`flex items-center justify-center gap-2 px-2 py-2.5 rounded-md border text-[13px] transition-all ${
                  draft.type === t.id
                    ? "border-gold-500/60 bg-gold-500/15 text-gold-200"
                    : "border-line text-parch-400 hover:border-fog-500/50"
                }`}
              >
                <Icon name={TYPE_ICON[t.id]} className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Заметка для сюжета">
          <textarea
            className="field min-h-[96px]"
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            placeholder="Что здесь происходит в книге…"
          />
        </Field>
        <div className="flex justify-end gap-3 mt-2">
          <Btn
            onClick={() => {
              setModal(null);
              setAddMode(false);
            }}
          >
            Отмена
          </Btn>
          <Btn variant="gold" onClick={save} disabled={!draft.name.trim()}>
            <Icon name="check" className="w-4 h-4" /> Поставить метку
          </Btn>
        </div>
      </Modal>
    </div>
  );
}
