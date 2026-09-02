import { useEffect, useMemo, useRef, useState } from "react";
import type { LocStatus, LocType, Location, Tab } from "../types";
import { LOC_STATUSES, LOC_TYPES } from "../types";
import { useLibrary } from "../hooks/useLibrary";
import { useSettings } from "../hooks/useSettings";
import { Icon, PATHS } from "../components/Icons";
import type { IconName } from "../components/Icons";
import { Btn, ConfirmBtn, Field, Modal, Reveal, SectionHead } from "../components/ui";

const TYPE_ICON: Record<LocType, IconName> = {
  city: "tower",
  port: "anchor",
  fortress: "shield",
  ruins: "column",
  village: "house",
  wilds: "mountain",
};
const STATUS_COLOR: Record<LocStatus, string> = {
  процветает: "var(--moss)",
  нейтрально: "var(--frost)",
  "в опасности": "var(--acc)",
  разрушено: "var(--danger)",
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

const ROADS = [
  "M152,392 C200,360 210,330 214,300",
  "M152,392 C260,360 360,340 452,316",
  "M452,316 C448,296 440,278 430,258",
  "M430,258 C390,238 344,222 298,204",
  "M452,316 C490,370 520,410 556,444",
  "M556,444 C630,480 700,515 762,538",
  "M452,316 C530,300 590,320 642,348",
];

function MapGlyph({ name, size = 16, sw = 1.7 }: { name: IconName; size?: number; sw?: number }) {
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
  status: LocStatus;
  description: string;
  characterIds: string[];
  eventIds: string[];
}
const emptyDraft: Draft = {
  name: "",
  type: "city",
  status: "нейтрально",
  description: "",
  characterIds: [],
  eventIds: [],
};

type Transform = { x: number; y: number; k: number };

export function MapPage({ onNav }: { onNav: (tab: Tab) => void }) {
  const lib = useLibrary();
  const { settings } = useSettings();
  const { locations, characters, events, party } = lib;

  const [selectedId, setSelectedId] = useState<string | null>(party.locationId);
  const [addMode, setAddMode] = useState(false);
  const [modal, setModal] = useState<null | { mode: "new"; x: number; y: number } | { mode: "edit"; loc: Location }>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [t, setT] = useState<Transform>({ x: 0, y: 0, k: 1 });

  const wrapRef = useRef<HTMLDivElement>(null);
  const tRef = useRef(t);
  tRef.current = t;
  const dragRef = useRef({ active: false, sx: 0, sy: 0, ox: 0, oy: 0, moved: 0 });
  const animRef = useRef(0);

  const byId = useMemo(() => new Map(locations.map((l) => [l.id, l])), [locations]);
  const current = party.locationId ? byId.get(party.locationId) ?? null : null;
  const selected = selectedId ? byId.get(selectedId) ?? null : null;
  const routeLocs = party.route.map((id) => byId.get(id)).filter(Boolean) as Location[];

  /* ===== геометрия: viewBox 1000×640, preserveAspectRatio=slice ===== */
  const metrics = () => {
    const el = wrapRef.current;
    if (!el) return { s: 1, ox: 0, oy: 0, rect: null as DOMRect | null };
    const rect = el.getBoundingClientRect();
    const s = Math.max(rect.width / 1000, rect.height / 640);
    return { s, ox: (1000 - rect.width / s) / 2, oy: (640 - rect.height / s) / 2, rect };
  };

  const screenToVB = (clientX: number, clientY: number) => {
    const m = metrics();
    if (!m.rect) return null;
    return {
      x: m.ox + (clientX - m.rect.left) / m.s,
      y: m.oy + (clientY - m.rect.top) / m.s,
    };
  };

  const animateTo = (target: Transform) => {
    cancelAnimationFrame(animRef.current);
    if (!settings.motion) {
      setT(target);
      return;
    }
    const from = { ...tRef.current };
    const start = performance.now();
    const dur = 560;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      setT({
        x: from.x + (target.x - from.x) * e,
        y: from.y + (target.y - from.y) * e,
        k: from.k + (target.k - from.k) * e,
      });
      if (p < 1) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
  };

  const focusOn = (loc: Location, k = 1.5) =>
    animateTo({ x: 500 - loc.x * k, y: 320 - loc.y * k, k });

  /* камера реагирует на смену сюжетной локации */
  useEffect(() => {
    const loc = party.locationId ? byId.get(party.locationId) : null;
    if (loc) focusOn(loc, Math.max(tRef.current.k, 1.25));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [party.locationId]);

  /* колесо мыши — зум к курсору (non-passive) */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const vb = screenToVB(e.clientX, e.clientY);
      if (!vb) return;
      setT((prev) => {
        const k = Math.min(4.5, Math.max(0.7, prev.k * Math.exp(-e.deltaY * 0.0016)));
        const cx = (vb.x - prev.x) / prev.k;
        const cy = (vb.y - prev.y) / prev.k;
        return { k, x: vb.x - cx * k, y: vb.y - cy * k };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const zoomAt = (factor: number) => {
    setT((prev) => {
      const k = Math.min(4.5, Math.max(0.7, prev.k * factor));
      const cx = (500 - prev.x) / prev.k;
      const cy = (320 - prev.y) / prev.k;
      return { k, x: 500 - cx * k, y: 320 - cy * k };
    });
  };

  /* ===== перетаскивание ===== */
  const onPointerDown = (e: React.PointerEvent) => {
    if (addMode) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { active: true, sx: e.clientX, sy: e.clientY, ox: tRef.current.x, oy: tRef.current.y, moved: 0 };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d.active) return;
    const m = metrics();
    const dx = (e.clientX - d.sx) / m.s;
    const dy = (e.clientY - d.sy) / m.s;
    d.moved = Math.max(d.moved, Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy));
    if (d.moved > 4) cancelAnimationFrame(animRef.current);
    setT((prev) => ({ ...prev, x: d.ox + dx, y: d.oy + dy }));
  };
  const onPointerUp = () => {
    dragRef.current.active = false;
  };
  const onMapClick = (e: React.MouseEvent) => {
    if (dragRef.current.moved > 6) {
      dragRef.current.moved = 0;
      return;
    }
    dragRef.current.moved = 0;
    if (addMode) {
      const vb = screenToVB(e.clientX, e.clientY);
      if (!vb) return;
      setDraft(emptyDraft);
      setModal({
        mode: "new",
        x: Math.round(Math.min(975, Math.max(25, vb.x))),
        y: Math.round(Math.min(615, Math.max(25, vb.y))),
      });
    } else {
      setSelectedId(null);
    }
  };

  const save = () => {
    if (!draft.name.trim() || !modal) return;
    const data = {
      name: draft.name.trim(),
      type: draft.type,
      status: draft.status,
      description: draft.description.trim(),
      characterIds: draft.characterIds,
      eventIds: draft.eventIds,
    };
    if (modal.mode === "new") lib.addLocation({ ...data, x: modal.x, y: modal.y });
    else lib.updateLocation(modal.loc.id, data);
    setModal(null);
    setAddMode(false);
  };

  const toggleId = (key: "characterIds" | "eventIds", id: string) => {
    setDraft((d) => ({
      ...d,
      [key]: d[key].includes(id) ? d[key].filter((x) => x !== id) : [...d[key], id],
    }));
  };

  return (
    <div className="tab-in">
      <SectionHead
        eyebrow="Живая карта"
        title="Земли Аэлории"
        sub="Колесо мыши — приближение, перетаскивание — обзор. Сюжетная локация отряда подсвечена; смена точки в сюжете мягко переносит камеру."
        action={
          <div className="flex gap-3">
            <Btn variant={addMode ? "accent" : "ghost"} onClick={() => setAddMode((v) => !v)}>
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

      <div className="grid xl:grid-cols-[1fr_340px] gap-6 items-start">
        {/* ===== полотно карты ===== */}
        <Reveal>
          <div
            ref={wrapRef}
            className={`panel-c relative overflow-hidden h-[62vh] min-h-[480px] select-none ${
              addMode ? "cursor-crosshair" : dragRef.current.active ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            {addMode && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-md border border-[color-mix(in_srgb,var(--acc)_55%,transparent)] bg-[color-mix(in_srgb,var(--panel)_92%,transparent)] tx1 text-sm shadow-lg">
                Режим метки: кликните туда, где стоит новое место
              </div>
            )}

            {/* туман */}
            <div className="fog-a absolute inset-[-15%] z-10 pointer-events-none opacity-25" style={{ background: "radial-gradient(45% 30% at 30% 40%, color-mix(in srgb, var(--frost) 22%, transparent), transparent 70%)" }} />
            <div className="fog-b absolute inset-[-15%] z-10 pointer-events-none opacity-20" style={{ background: "radial-gradient(40% 28% at 70% 65%, color-mix(in srgb, var(--moss) 20%, transparent), transparent 70%)" }} />

            {/* управление камерой */}
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5">
              <MapBtn onClick={() => zoomAt(1.35)} title="Приблизить" icon="plus" />
              <MapBtn onClick={() => zoomAt(1 / 1.35)} title="Отдалить" icon="chevronL" rotate />
              <MapBtn onClick={() => animateTo({ x: 0, y: 0, k: 1 })} title="Вся карта" icon="compass" />
              <MapBtn
                onClick={() => current && focusOn(current)}
                title="Найти отряд"
                icon="star"
                accent
              />
            </div>

            <div className="absolute bottom-3 left-4 z-20 font-mono text-[10px] tracking-[0.2em] uppercase tx3">
              масштаб ×{t.k.toFixed(1)}
            </div>

            <svg
              viewBox="0 0 1000 640"
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 w-full h-full"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
              onClick={onMapClick}
              role="img"
              aria-label="Карта континента Аэлория"
            >
              <defs>
                <pattern id="waves" width="90" height="34" patternUnits="userSpaceOnUse">
                  <path d="M0 17 q11 -7 22 0 t22 0 t22 0 t22 0" fill="none" style={{ stroke: "var(--frost)" }} strokeOpacity="0.12" strokeWidth="1.2" />
                </pattern>
                <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                  <line x1="0" y1="0" x2="0" y2="7" style={{ stroke: "var(--ink-map)" }} strokeOpacity="0.05" strokeWidth="1" />
                </pattern>
                <radialGradient id="landGrad" cx="45%" cy="38%" r="80%">
                  <stop offset="0%" style={{ stopColor: "var(--land-2)" }} />
                  <stop offset="100%" style={{ stopColor: "var(--land)" }} />
                </radialGradient>
              </defs>

              <g transform={`translate(${t.x},${t.y}) scale(${t.k})`}>
                {/* море и суша */}
                <rect x="-400" y="-300" width="1800" height="1240" style={{ fill: "var(--sea)" }} />
                <rect x="-400" y="-300" width="1800" height="1240" fill="url(#waves)" />
                {[-300, 100, 500].map((y) =>
                  [0, 400, 800].map((x) => (
                    <path
                      key={`${x}${y}`}
                      d={`M${x + 40},${y + 60} q11 -7 22 0 t22 0`}
                      fill="none"
                      style={{ stroke: "var(--frost)" }}
                      strokeOpacity="0.2"
                      strokeWidth="1.3"
                    />
                  )),
                )}
                <path d={LAND_PATH} fill="url(#landGrad)" style={{ stroke: "var(--coast)" }} strokeOpacity="0.65" strokeWidth="2.4" />
                <path d={LAND_PATH} fill="url(#hatch)" style={{ stroke: "var(--coast)" }} strokeOpacity="0.12" strokeWidth="9" />
                <path d={ISLE_PATH} fill="url(#landGrad)" style={{ stroke: "var(--coast)" }} strokeOpacity="0.6" strokeWidth="1.8" />

                {/* горы */}
                <g fill="none" style={{ stroke: "var(--ink-map)" }} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M330,292 L356,246 L382,290 L408,240 L434,288 L460,242 L486,290 L512,250 L538,292" strokeWidth="2.4" strokeOpacity="0.75" />
                  <path d="M352,308 L376,268 L400,306 L424,264 L448,304 L472,268 L496,306" strokeWidth="1.5" strokeOpacity="0.38" />
                </g>

                {/* озеро и река */}
                <ellipse cx="500" cy="377" rx="36" ry="19" style={{ fill: "var(--sea)", stroke: "var(--frost)" }} strokeOpacity="0.5" strokeWidth="1.4" />
                <path
                  d="M470,310 C490,345 515,355 535,390 C560,430 615,455 660,485 C700,510 736,527 762,538"
                  fill="none"
                  style={{ stroke: "var(--frost)" }}
                  strokeOpacity="0.55"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />

                {/* лес */}
                <g style={{ stroke: "var(--moss)" }} strokeOpacity="0.85" fill="none" strokeWidth="1.3" strokeLinejoin="round">
                  {TREES.map(([x, y], i) => (
                    <path key={i} d={`M${x - 6},${y} L${x},${y - 12} L${x + 6},${y} Z M${x},${y} v4`} />
                  ))}
                </g>

                {/* дороги */}
                {ROADS.map((d, i) => (
                  <path key={i} d={d} fill="none" style={{ stroke: "var(--ink-map)" }} strokeOpacity="0.3" strokeWidth="1.6" strokeDasharray="1.5 7" strokeLinecap="round" />
                ))}

                {/* подписи регионов и морей */}
                <text x="430" y="222" className="map-region-label">СЕРЫЙ ГРЕБЕНЬ</text>
                <text x="655" y="318" className="map-region-label" style={{ fontSize: 10 }}>ШЁПОТ-ЛЕС</text>
                <text x="168" y="78" className="map-water-label" transform="rotate(-4 168 78)">СТУДЁНОЕ МОРЕ</text>
                <text x="846" y="600" className="map-water-label" style={{ fontSize: 15 }} transform="rotate(-8 846 600)">ЗАЛИВ СИРЕН</text>

                {/* роза ветров */}
                <g transform="translate(905,92)" style={{ stroke: "var(--gold)" }} fill="none" opacity="0.6">
                  <circle r="46" strokeWidth="1" />
                  <circle r="38" strokeWidth="0.6" strokeDasharray="2 5" />
                  <path d="M0,-44 L7,-7 L44,0 L7,7 L0,44 L-7,7 L-44,0 L-7,-7 Z" strokeWidth="1.2" />
                  <path d="M0,-26 L4,-4 L26,0 L4,4 L0,26 L-4,4 L-26,0 L-4,-4 Z" strokeWidth="0.8" opacity="0.7" transform="rotate(45)" />
                  <circle r="4" style={{ fill: "var(--gold)" }} stroke="none" />
                  <text y="-52" textAnchor="middle" style={{ fill: "var(--gold)", font: "600 15px Cormorant, serif" }} stroke="none">С</text>
                </g>

                {/* картуш и масштаб */}
                <g transform="translate(52,540)">
                  <rect width="262" height="66" rx="4" fillOpacity="0.88" style={{ fill: "var(--panel)", stroke: "var(--gold)" }} strokeOpacity="0.5" strokeWidth="1.4" />
                  <rect x="5" y="5" width="252" height="56" rx="2" fill="none" style={{ stroke: "var(--gold)" }} strokeOpacity="0.22" strokeWidth="0.8" />
                  <text x="131" y="31" textAnchor="middle" style={{ fill: "var(--tx)", font: "italic 600 22px Cormorant, serif", letterSpacing: "0.08em" }}>
                    Земли Аэлории
                  </text>
                  <text x="131" y="50" textAnchor="middle" style={{ fill: "var(--tx-2)", font: "10px 'IBM Plex Mono', monospace", letterSpacing: "0.22em" }}>
                    КАРТА ИЗВЕСТНОГО МИРА
                  </text>
                </g>
                <g transform="translate(790,612)" style={{ stroke: "var(--tx-2)" }} strokeWidth="1.4">
                  <line x1="0" y1="0" x2="120" y2="0" />
                  <line x1="0" y1="-5" x2="0" y2="5" />
                  <line x1="60" y1="-4" x2="60" y2="4" />
                  <line x1="120" y1="-5" x2="120" y2="5" />
                  <text x="60" y="-10" textAnchor="middle" style={{ fill: "var(--tx-2)", font: "10px 'IBM Plex Mono', monospace", letterSpacing: "0.15em" }} stroke="none">
                    100 ВЁРСТ
                  </text>
                </g>

                {/* маршрут отряда */}
                {routeLocs.length > 1 && (
                  <polyline
                    points={routeLocs.map((l) => `${l.x},${l.y}`).join(" ")}
                    fill="none"
                    style={{ stroke: "var(--acc)" }}
                    strokeOpacity="0.9"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="route-line"
                  />
                )}

                {/* метки */}
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
                        <circle r="22" fill="none" style={{ stroke: "var(--acc)" }} strokeOpacity="0.85" strokeWidth="1.2" strokeDasharray="4 6" className="anim-spin-slow" />
                      )}
                      <circle
                        r="14"
                        style={{ fill: "var(--panel)", stroke: isHere ? "var(--acc)" : "var(--gold)" }}
                        fillOpacity="0.96"
                        strokeOpacity={isHere ? 1 : 0.65}
                        strokeWidth={isHere ? 2 : 1.5}
                      />
                      <g style={{ color: isHere ? "var(--acc)" : "var(--ink-map)" }}>
                        <MapGlyph name={TYPE_ICON[l.type]} />
                      </g>
                      <circle cx="10" cy="-10" r="3.4" style={{ fill: STATUS_COLOR[l.status] }} stroke="none" />
                      <text y="30" className="map-label" style={isHere ? { fill: "var(--acc)" } : undefined}>
                        {l.name}
                      </text>
                    </g>
                  );
                })}

                {/* маркер отряда */}
                {current && (
                  <g transform={`translate(${current.x},${current.y - 27})`} style={{ pointerEvents: "none" }}>
                    <circle r="9" style={{ fill: "var(--acc)" }} fillOpacity="0.3" className="party-ripple" />
                    <circle r="9" style={{ fill: "var(--acc)", animationDelay: "1.2s" }} fillOpacity="0.25" className="party-ripple" />
                    <circle r="9.5" style={{ fill: "var(--panel)", stroke: "var(--acc)" }} strokeWidth="1.6" />
                    <g style={{ color: "var(--acc)" }}>
                      <MapGlyph name="star" size={12} sw={2} />
                    </g>
                    <path d="M9.5,0 L23,-7 L23,7 Z" style={{ fill: "var(--danger)", stroke: "var(--acc)" }} strokeWidth="0.8" />
                  </g>
                )}
              </g>
            </svg>

            {/* виньетка */}
            <div className="absolute inset-0 z-10 pointer-events-none" style={{ boxShadow: "inset 0 0 90px rgba(0,0,0,0.35)", borderRadius: 10 }} />
          </div>

          {/* легенда */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 px-2">
            {LOC_TYPES.map((lt) => (
              <span key={lt.id} className="inline-flex items-center gap-2 text-sm tx3">
                <Icon name={TYPE_ICON[lt.id]} className="w-4 h-4 acc-t" /> {lt.label}
              </span>
            ))}
            <span className="inline-flex items-center gap-2 text-sm tx3 ml-auto">
              <span className="relative flex w-3 h-3">
                <span className="absolute inline-flex w-full h-full rounded-full bg-[var(--acc)] opacity-60 party-ripple" />
                <span className="relative inline-flex w-3 h-3 rounded-full bg-[var(--acc)]" />
              </span>
              отряд героев
            </span>
          </div>
        </Reveal>

        {/* ===== боковая панель ===== */}
        <div className="space-y-5 xl:sticky xl:top-24">
          <Reveal delay={80}>
            <div className="panel-c p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <Icon name="star" className="w-4 h-4 acc-t" />
                <span className="font-mono text-[10px] tracking-[0.24em] uppercase tx3">Отряд по сюжету</span>
              </div>
              {current ? (
                <>
                  <p className="font-display text-2xl font-semibold tx1 leading-tight">{current.name}</p>
                  <p className="text-sm tx3 mt-0.5 mb-4">
                    {LOC_TYPES.find((x) => x.id === current.type)?.label} · герои сейчас здесь
                  </p>
                </>
              ) : (
                <p className="text-sm tx3 italic mb-4">Отряд в пути — отметьте точку на карте.</p>
              )}
              {routeLocs.length > 0 && (
                <div className="border-t line-c pt-3.5">
                  <p className="font-mono text-[10px] tracking-[0.2em] uppercase tx3 mb-2.5">Пройденный путь</p>
                  <div className="flex flex-wrap items-center gap-y-2">
                    {routeLocs.map((l, i) => (
                      <span key={l.id} className="flex items-center">
                        {i > 0 && <Icon name="arrow" className="w-3.5 h-3.5 mx-1 text-[var(--acc)] opacity-70" />}
                        <button
                          onClick={() => {
                            setSelectedId(l.id);
                            focusOn(l, 1.5);
                          }}
                          className={`px-2.5 py-1 rounded-full border text-[13px] transition-colors ${
                            i === routeLocs.length - 1
                              ? "border-[color-mix(in_srgb,var(--acc)_60%,transparent)] bg-[color-mix(in_srgb,var(--acc)_12%,transparent)] tx1"
                              : "line-c tx3 hover:tx1"
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

          <Reveal delay={160}>
            <div className="panel-c panel-corner p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <Icon name="compass" className="w-4 h-4 tx2" />
                <span className="font-mono text-[10px] tracking-[0.24em] uppercase tx3">Карточка места</span>
              </div>
              {selected ? (
                <>
                  <div className="flex items-start gap-3 mb-3">
                    <span className="w-10 h-10 rounded-full border flex items-center justify-center shrink-0" style={{ borderColor: "color-mix(in srgb, var(--gold) 45%, transparent)" }}>
                      <Icon name={TYPE_ICON[selected.type]} className="w-5 h-5 acc-t" />
                    </span>
                    <div>
                      <p className="font-display text-xl font-semibold tx1 leading-tight">{selected.name}</p>
                      <p className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-[10px] uppercase tracking-wider tx3">
                          {LOC_TYPES.find((x) => x.id === selected.type)?.label}
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider" style={{ color: STATUS_COLOR[selected.status] }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLOR[selected.status] }} />
                          {selected.status}
                        </span>
                      </p>
                    </div>
                  </div>
                  <p className="text-[14.5px] leading-relaxed tx2 mb-4">
                    {selected.description || "Описание ещё не записано."}
                  </p>

                  {selected.characterIds.length > 0 && (
                    <div className="mb-3">
                      <p className="font-mono text-[10px] tracking-[0.18em] uppercase tx3 mb-1.5">Здесь бывают</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.characterIds.map((id) => {
                          const c = characters.find((x) => x.id === id);
                          return c ? (
                            <button key={id} onClick={() => onNav("characters")} className="px-2 py-0.5 rounded border line-c tx3 text-[12px] hover:tx1 hover:border-[var(--line-2)] transition-colors">
                              {c.name}
                            </button>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                  {selected.eventIds.length > 0 && (
                    <div className="mb-4">
                      <p className="font-mono text-[10px] tracking-[0.18em] uppercase tx3 mb-1.5">События</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.eventIds.map((id) => {
                          const ev = events.find((x) => x.id === id);
                          return ev ? (
                            <button key={id} onClick={() => onNav("timeline")} className="px-2 py-0.5 rounded border line-c tx3 text-[12px] hover:tx1 hover:border-[var(--line-2)] transition-colors">
                              {ev.title}
                            </button>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2.5">
                    {party.locationId !== selected.id && (
                      <Btn
                        variant="accent"
                        onClick={() => lib.moveParty(selected.id)}
                        className="flex-1 justify-center"
                      >
                        <Icon name="star" className="w-4 h-4" /> Отряд сюда
                      </Btn>
                    )}
                    <Btn
                      onClick={() => {
                        setDraft({
                          name: selected.name,
                          type: selected.type,
                          status: selected.status,
                          description: selected.description,
                          characterIds: selected.characterIds,
                          eventIds: selected.eventIds,
                        });
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
                      className="border line-c rounded-md px-2.5"
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm tx3 italic">
                  Кликните по метке, чтобы узнать о месте, связать его с персонажами и событиями — или отправить сюда отряд.
                </p>
              )}
            </div>
          </Reveal>

          <Reveal delay={240}>
            <div className="panel-c overflow-hidden">
              <div className="px-5 py-3 border-b line-c flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.24em] uppercase tx3">Все места</span>
                <span className="font-mono text-[11px] acc-t">{locations.length}</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {locations.map((l) => (
                  <div
                    key={l.id}
                    className={`flex items-center gap-3 px-5 py-2.5 border-b line-c last:border-b-0 transition-colors ${
                      selectedId === l.id ? "bg-[color-mix(in_srgb,var(--acc)_8%,transparent)]" : "hover:bg-[color-mix(in_srgb,var(--panel-2)_60%,transparent)]"
                    }`}
                  >
                    <button onClick={() => setSelectedId(l.id)} className="flex items-center gap-3 min-w-0 flex-1 text-left">
                      <Icon name={TYPE_ICON[l.type]} className="w-4 h-4 shrink-0 acc-t opacity-80" />
                      <span className={`truncate text-sm ${selectedId === l.id ? "tx1" : "tx2"}`}>{l.name}</span>
                    </button>
                    {party.locationId === l.id && <Icon name="star" className="w-3.5 h-3.5 shrink-0 acc-t" />}
                    <button
                      onClick={() => {
                        setSelectedId(l.id);
                        focusOn(l, 1.5);
                      }}
                      className="tx3 hover:acc-t transition-colors shrink-0"
                      title="Показать на карте"
                    >
                      <Icon name="compass" className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ===== модалка метки ===== */}
      <Modal
        open={modal !== null}
        onClose={() => {
          setModal(null);
          setAddMode(false);
        }}
        title={modal?.mode === "edit" ? "Правка метки" : "Новое место на карте"}
        wide
      >
        {modal?.mode === "new" && (
          <p className="font-mono text-[11px] tracking-wider tx3 mb-4">
            Координаты: {modal.x}, {modal.y}
          </p>
        )}
        <div className="grid sm:grid-cols-2 gap-x-4">
          <Field label="Название">
            <input className="field" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Лунный порт" autoFocus />
          </Field>
          <Field label="Статус">
            <select className="field" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as LocStatus })}>
              {LOC_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Тип места">
          <div className="grid grid-cols-3 gap-2">
            {LOC_TYPES.map((lt) => (
              <button
                key={lt.id}
                onClick={() => setDraft({ ...draft, type: lt.id })}
                className={`flex items-center justify-center gap-2 px-2 py-2.5 rounded-md border text-[13px] transition-colors ${
                  draft.type === lt.id
                    ? "border-[color-mix(in_srgb,var(--acc)_60%,transparent)] bg-[color-mix(in_srgb,var(--acc)_12%,transparent)] tx1"
                    : "line-c tx3 hover:tx2"
                }`}
              >
                <Icon name={TYPE_ICON[lt.id]} className="w-4 h-4" /> {lt.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Описание и роль в сюжете">
          <textarea className="field min-h-[96px]" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Что здесь происходит в книге…" />
        </Field>
        <Field label="Связанные персонажи">
          <div className="flex flex-wrap gap-2">
            {characters.map((c) => (
              <ChipToggle key={c.id} active={draft.characterIds.includes(c.id)} onClick={() => toggleId("characterIds", c.id)}>
                {c.name}
              </ChipToggle>
            ))}
          </div>
        </Field>
        <Field label="Связанные события">
          <div className="flex flex-wrap gap-2">
            {events.map((ev) => (
              <ChipToggle key={ev.id} active={draft.eventIds.includes(ev.id)} onClick={() => toggleId("eventIds", ev.id)}>
                {ev.title}
              </ChipToggle>
            ))}
          </div>
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
          <Btn variant="accent" onClick={save} disabled={!draft.name.trim()}>
            <Icon name="check" className="w-4 h-4" /> Поставить метку
          </Btn>
        </div>
      </Modal>
    </div>
  );
}

function MapBtn({ onClick, title, icon, accent, rotate }: { onClick: () => void; title: string; icon: IconName; accent?: boolean; rotate?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`w-9 h-9 rounded-md border flex items-center justify-center transition-all backdrop-blur-sm ${
        accent
          ? "border-[color-mix(in_srgb,var(--acc)_55%,transparent)] bg-[color-mix(in_srgb,var(--acc)_15%,var(--panel))] acc-t hover:bg-[color-mix(in_srgb,var(--acc)_28%,var(--panel))]"
          : "line-c bg-[color-mix(in_srgb,var(--panel)_88%,transparent)] tx2 hover:tx1 hover:border-[var(--line-2)]"
      }`}
    >
      <Icon name={icon} className={`w-4 h-4 ${rotate ? "-rotate-90" : ""}`} />
    </button>
  );
}

function ChipToggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full border text-[12.5px] transition-colors ${
        active
          ? "border-[color-mix(in_srgb,var(--acc)_60%,transparent)] bg-[color-mix(in_srgb,var(--acc)_12%,transparent)] tx1"
          : "line-c tx3 hover:tx2"
      }`}
    >
      {children}
    </button>
  );
}
