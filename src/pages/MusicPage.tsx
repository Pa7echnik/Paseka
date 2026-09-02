import type { MusicTrack } from "../types";
import { useLibrary } from "../hooks/useLibrary";
import { usePlayer } from "../hooks/usePlayer";
import { useSettings } from "../hooks/useSettings";
import { Icon } from "../components/Icons";
import { Reveal, SectionHead } from "../components/ui";

function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${String(ss).padStart(2, "0")}`;
}

function TrackArt({ t, size = "md" }: { t: MusicTrack; size?: "md" | "lg" }) {
  const cls = size === "lg" ? "w-[210px] h-[210px]" : "w-11 h-11";
  return (
    <div
      className={`${cls} rounded-lg border flex items-center justify-center relative overflow-hidden shrink-0`}
      style={{
        borderColor: "color-mix(in srgb, var(--gold) 35%, transparent)",
        background:
          "radial-gradient(80% 80% at 30% 25%, color-mix(in srgb, var(--acc) 22%, transparent), transparent 65%), var(--bg-2)",
      }}
    >
      <Icon name="music" className={size === "lg" ? "w-14 h-14 tx3" : "w-4.5 h-4.5 tx3"} />
      {size === "lg" && (
        <span className="absolute bottom-3 right-3 font-display text-5xl font-semibold tx3 opacity-50">
          {t.title[0]}
        </span>
      )}
    </div>
  );
}

export function MusicPage() {
  const player = usePlayer();
  const lib = useLibrary();
  const { settings, update } = useSettings();

  const { current, playing, progress, tracks } = player;
  const pct = current ? Math.min(100, (progress / current.duration) * 100) : 0;

  const boundLabel = (t: MusicTrack): string | null => {
    if (t.boundChapterId) {
      const ch = lib.chapters.find((c) => c.id === t.boundChapterId);
      return ch ? `к главе «${ch.title}»` : null;
    }
    if (t.boundLocationId) {
      const l = lib.locations.find((x) => x.id === t.boundLocationId);
      return l ? `к локации «${l.name}»` : null;
    }
    return null;
  };

  return (
    <div className="tab-in">
      <SectionHead
        eyebrow="Звук и атмосфера"
        title="Музыка рукописи"
        sub="Плейстедер книги: темы локаций и сцен. Сейчас — демо-список; первый трек звучит по-настоящему (встроенный синтез), остальные ждут ваших файлов."
      />

      <div className="grid xl:grid-cols-[1fr_380px] gap-6 items-start">
        {/* ===== плеер ===== */}
        <Reveal>
          <div className="panel-c panel-corner p-7 sm:p-9">
            {current ? (
              <div className="flex flex-col sm:flex-row gap-8 items-start">
                <TrackArt t={current} size="lg" />
                <div className="flex-1 min-w-0 w-full">
                  <p className="eyebrow mb-2">
                    сейчас звучит · {current.category}
                  </p>
                  <h2 className="font-display text-4xl font-semibold tx1 leading-tight">{current.title}</h2>
                  <p className="tx3 mt-1.5">{current.subtitle}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2.5 py-1 rounded border line-c tx3 text-[12px]">{current.category}</span>
                    {boundLabel(current) && (
                      <span className="px-2.5 py-1 rounded border line-c tx3 text-[12px] inline-flex items-center gap-1.5">
                        <Icon name="route" className="w-3 h-3" /> {boundLabel(current)}
                      </span>
                    )}
                    {!current.src && (
                      <span className="px-2.5 py-1 rounded border border-dashed line-c tx3 text-[12px]">
                        заглушка — файл не подключён
                      </span>
                    )}
                  </div>

                  {/* прогресс */}
                  <div className="mt-8">
                    <div className="h-1.5 rounded-full bg-[var(--line)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--acc)] transition-[width] duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 font-mono text-[11px] tx3">
                      <span>{fmtTime(progress)}</span>
                      <span>{fmtTime(current.duration)}</span>
                    </div>
                  </div>

                  {/* управление */}
                  <div className="flex items-center gap-4 mt-6">
                    <button onClick={player.prev} className="p-2 tx2 hover:tx1 transition-colors" title="Предыдущий трек">
                      <Icon name="prev" className="w-6 h-6" />
                    </button>
                    <button
                      onClick={player.toggle}
                      className="w-14 h-14 rounded-full bg-[var(--acc)] text-[var(--bg)] flex items-center justify-center hover:bg-[var(--acc-strong)] transition-all hover:shadow-[0_0_30px_-6px_var(--acc)] active:scale-95"
                      title={playing ? "Пауза" : "Играть"}
                    >
                      <Icon name={playing ? "pause" : "play"} className="w-6 h-6" strokeWidth={2} />
                    </button>
                    <button onClick={player.next} className="p-2 tx2 hover:tx1 transition-colors" title="Следующий трек">
                      <Icon name="next" className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-3 ml-auto flex-1 max-w-[220px]">
                      <Icon name="volume" className="w-4.5 h-4.5 tx3 shrink-0" />
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={settings.volume}
                        onChange={(e) => update({ volume: Number(e.target.value) })}
                        className="vol w-full"
                        style={{ "--fill": `${settings.volume}%` } as React.CSSProperties}
                        aria-label="Громкость"
                      />
                      <span className="font-mono text-[11px] tx3 w-8 text-right">{settings.volume}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-14">
                <Icon name="music" className="w-10 h-10 tx3 mx-auto mb-4" />
                <p className="tx2 mb-5">Тишина над гаванью. Выберите тему из списка справа.</p>
                <button
                  onClick={() => player.play(tracks[0].id)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[var(--acc)] text-[var(--bg)] font-semibold hover:bg-[var(--acc-strong)] transition-colors"
                >
                  <Icon name="play" className="w-4 h-4" /> Включить ветер
                </button>
              </div>
            )}
          </div>
        </Reveal>

        {/* ===== список тем ===== */}
        <div className="space-y-5">
          <Reveal delay={100}>
            <div className="panel-c overflow-hidden">
              <div className="px-5 py-3 border-b line-c flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.24em] uppercase tx3">Темы и эмбиент</span>
                <span className="font-mono text-[11px] acc-t">{tracks.length}</span>
              </div>
              <div>
                {tracks.map((t) => {
                  const active = current?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      className={`flex items-center gap-3.5 px-5 py-3 border-b line-c last:border-b-0 transition-colors ${
                        active ? "bg-[color-mix(in_srgb,var(--acc)_9%,transparent)]" : "hover:bg-[color-mix(in_srgb,var(--panel-2)_60%,transparent)]"
                      }`}
                    >
                      <button onClick={() => (active ? player.toggle() : player.play(t.id))} className="shrink-0" title="Играть">
                        <TrackArt t={t} />
                      </button>
                      <button onClick={() => (active ? player.toggle() : player.play(t.id))} className="min-w-0 flex-1 text-left group">
                        <p className={`font-medium truncate ${active ? "acc-t" : "tx1 group-hover:acc-t"} transition-colors`}>
                          {t.title}
                        </p>
                        <p className="tx3 text-[12.5px] truncate">{boundLabel(t) ?? t.subtitle}</p>
                      </button>
                      {active && playing ? (
                        <span className="flex items-end gap-[3px] h-4 shrink-0" aria-hidden>
                          {[0.9, 0.55, 1.1, 0.7].map((d, i) => (
                            <span
                              key={i}
                              className="eq-bar w-[3px] rounded-sm bg-[var(--acc)]"
                              style={{ height: "100%", animationDuration: `${d}s`, animationDelay: `${i * 0.12}s` }}
                            />
                          ))}
                        </span>
                      ) : (
                        <span className="font-mono text-[11px] tx3 shrink-0">{fmtTime(t.duration)}</span>
                      )}
                      <button
                        onClick={() => (active ? player.toggle() : player.play(t.id))}
                        className={`p-2 rounded-full border transition-all shrink-0 ${
                          active
                            ? "border-[color-mix(in_srgb,var(--acc)_55%,transparent)] acc-t"
                            : "line-c tx3 hover:tx1 hover:border-[var(--line-2)]"
                        }`}
                        title={active && playing ? "Пауза" : "Играть"}
                      >
                        <Icon name={active && playing ? "pause" : "play"} className="w-3.5 h-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>

          <Reveal delay={180}>
            <div className="panel-in p-5">
              <p className="font-mono text-[10px] tracking-[0.22em] uppercase acc-t mb-2">как добавить свою музыку</p>
              <p className="font-mono text-[12.5px] leading-relaxed tx3">
                Положите файл в <span className="tx2">public/audio/</span> и укажите в{" "}
                <span className="tx2">src/data/music.ts</span>:{" "}
                <span className="tx2">src: "/audio/moya-tema.mp3"</span>. Трек заиграет по-настоящему; поле{" "}
                <span className="tx2">boundChapterId / boundLocationId</span> привяжет его к главе или локации.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
