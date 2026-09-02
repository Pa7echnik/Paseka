import type { Tab } from "../types";
import { useLibrary, wordCount, toRoman, fmtDate } from "../hooks/useLibrary";
import { Book3D } from "../components/Book3D";
import { Icon } from "../components/Icons";
import type { IconName } from "../components/Icons";
import { Btn, InkTitle, Ornament, Reveal, Tilt } from "../components/ui";

export function HomePage({
  onRead,
  onNav,
}: {
  onRead: (chapterId: string) => void;
  onNav: (tab: Tab) => void;
}) {
  const lib = useLibrary();
  const { meta, chapters, characters, locations, events, party, progress } = lib;

  const totalWords = chapters.reduce((s, c) => s + wordCount(c.content), 0);
  const lastOpened =
    chapters.find((c) => c.id === progress.lastOpenedChapterId) ?? chapters[0] ?? null;
  const currentLoc = locations.find((l) => l.id === party.locationId) ?? null;
  const parts = Array.from(new Set(chapters.map((c) => c.part)));

  const stats: { label: string; value: string }[] = [
    { label: "глав", value: String(chapters.length) },
    { label: "слов", value: totalWords.toLocaleString("ru-RU") },
    { label: "персонажей", value: String(characters.length) },
    { label: "локаций", value: String(locations.length) },
    { label: "событий", value: String(events.length) },
  ];

  return (
    <div>
      {/* ===== открывающий разворот: книга + хроника ===== */}
      <div className="grid lg:grid-cols-[400px_1fr] gap-10 lg:gap-14 items-center mb-16">
        <Reveal className="relative order-2 lg:order-1">
          <div
            className="absolute inset-0 -z-10 blur-3xl opacity-40"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 45%, color-mix(in srgb, var(--acc) 30%, transparent), transparent 70%)",
            }}
            aria-hidden
          />
          <Book3D title={meta.title} author={meta.author} />
        </Reveal>

        <div className="order-1 lg:order-2">
          <Reveal>
            <p className="eyebrow mb-4">рукопись · тёмное фэнтези · пишется</p>
          </Reveal>
          <InkTitle>
            <h1 className="font-display font-semibold text-[clamp(3rem,7vw,5.2rem)] leading-[0.98] tx1">
              {meta.title}
            </h1>
          </InkTitle>
          <Reveal delay={120}>
            <p className="mt-5 font-display italic text-xl sm:text-2xl tx2 max-w-xl leading-snug">
              {meta.subtitle}
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 tx3 text-sm">
              <span className="inline-flex items-center gap-2">
                <Icon name="quill" className="w-4 h-4 acc-t" /> {meta.author}
              </span>
              <span>{chapters.length} глав · {totalWords.toLocaleString("ru-RU")} слов</span>
              {lastOpened && <span>обновлено {fmtDate(Math.max(...chapters.map((c) => c.updatedAt)))}</span>}
            </div>
          </Reveal>
          <Reveal delay={280}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Btn variant="accent" onClick={() => lastOpened && onRead(lastOpened.id)} className="px-6 py-2.5 text-[15px]">
                <Icon name="book" className="w-4.5 h-4.5" />
                {progress.readChapterIds.length > 0 ? "Читать дальше" : "Начать читать"}
              </Btn>
              <Btn onClick={() => onNav("map")} className="px-6 py-2.5 text-[15px]">
                <Icon name="map" className="w-4.5 h-4.5" /> Карта мира
              </Btn>
            </div>
          </Reveal>
          <Reveal delay={360}>
            <Ornament className="mt-10 max-w-sm" />
          </Reveal>
        </div>
      </div>

      {/* ===== лента статистики ===== */}
      <Reveal>
        <div className="panel-c px-8 py-6 mb-14 flex flex-wrap items-center gap-x-12 gap-y-4">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-display text-4xl font-semibold tx1 leading-none">{s.value}</p>
              <p className="font-mono text-[10px] tracking-[0.22em] uppercase tx3 mt-1.5">{s.label}</p>
            </div>
          ))}
          <div className="ml-auto hidden md:flex items-center gap-2 tx3 text-sm">
            <span className="relative flex w-2.5 h-2.5">
              <span className="absolute w-full h-full rounded-full bg-[var(--acc)] opacity-50 glimmer" />
              <span className="relative w-2.5 h-2.5 rounded-full bg-[var(--acc)]" />
            </span>
            книга в работе — черновик
          </div>
        </div>
      </Reveal>

      {/* ===== оглавление + сводки ===== */}
      <div className="grid lg:grid-cols-12 gap-6">
        <Reveal className="lg:col-span-7">
          <div className="panel-c panel-corner h-full p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-3xl font-semibold tx1">Оглавление</h2>
              <span className="font-mono text-[11px] tx3">{chapters.length} записей</span>
            </div>
            <div>
              {chapters.map((ch, i) => {
                const read = progress.readChapterIds.includes(ch.id);
                const isLast = progress.lastOpenedChapterId === ch.id;
                const loc = locations.find((l) => l.id === ch.locationId);
                return (
                  <button
                    key={ch.id}
                    onClick={() => onRead(ch.id)}
                    className="group w-full text-left flex items-center gap-5 py-4 border-b line-c last:border-b-0 transition-colors hover:bg-[color-mix(in_srgb,var(--panel-2)_60%,transparent)] rounded-md px-2 -mx-2"
                  >
                    <span className={`font-display text-2xl font-semibold w-12 shrink-0 ${isLast ? "acc-t" : "tx3"}`}>
                      {toRoman(ch.order + 1)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-xl font-medium tx1 group-hover:acc-t transition-colors truncate">
                        {ch.title}
                      </span>
                      <span className="block tx3 text-[13px] mt-0.5 truncate">
                        {ch.part} · {wordCount(ch.content).toLocaleString("ru-RU")} слов
                        {loc ? ` · ${loc.name}` : ""}
                      </span>
                    </span>
                    {isLast ? (
                      <span className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider acc-t">
                        <Icon name="star" className="w-3.5 h-3.5" /> вы здесь
                      </span>
                    ) : read ? (
                      <Icon name="check" className="w-4 h-4 shrink-0 tx3" />
                    ) : (
                      <span className="w-4 h-4 shrink-0 rounded-full border line-c" />
                    )}
                    <Icon name="chevronR" className="w-4 h-4 shrink-0 tx3 group-hover:acc-t transition-all group-hover:translate-x-0.5" />
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>

        <div className="lg:col-span-5 space-y-6">
          {/* текущее место в истории */}
          <Reveal delay={100}>
            <Tilt>
              <div className="panel-c p-6">
                <p className="eyebrow mb-3">текущее место в истории</p>
                {currentLoc ? (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="relative flex w-3 h-3 shrink-0">
                        <span className="absolute w-full h-full rounded-full bg-[var(--acc)] opacity-50 glimmer" />
                        <span className="relative w-3 h-3 rounded-full bg-[var(--acc)]" />
                      </span>
                      <h3 className="font-display text-2xl font-semibold tx1">{currentLoc.name}</h3>
                    </div>
                    <p className="tx3 text-sm leading-relaxed mb-4">
                      Отряд героев находится здесь по сюжету. Маркер и путь отмечены на карте мира.
                    </p>
                  </>
                ) : (
                  <p className="tx3 text-sm mb-4">Отряд в пути — отметьте точку на карте.</p>
                )}
                <Btn onClick={() => onNav("map")} className="w-full justify-center">
                  <Icon name="compass" className="w-4 h-4" /> Показать на карте
                </Btn>
              </div>
            </Tilt>
          </Reveal>

          {/* последнее открытое */}
          <Reveal delay={180}>
            <Tilt>
              <div className="panel-c p-6">
                <p className="eyebrow mb-3">последнее открытое</p>
                {lastOpened ? (
                  <>
                    <h3 className="font-display text-2xl font-semibold tx1 mb-1">
                      {toRoman(lastOpened.order + 1)}. {lastOpened.title}
                    </h3>
                    <p className="tx3 text-sm mb-4">{lastOpened.part}</p>
                    <Btn variant="accent" onClick={() => onRead(lastOpened.id)} className="w-full justify-center">
                      <Icon name="book" className="w-4 h-4" /> Продолжить чтение
                    </Btn>
                  </>
                ) : (
                  <p className="tx3 text-sm">Рукопись пока пуста.</p>
                )}
              </div>
            </Tilt>
          </Reveal>

          {/* сцены и разделы */}
          <Reveal delay={260}>
            <div className="panel-c p-6">
              <p className="eyebrow mb-4">сцены и разделы</p>
              <div className="space-y-4">
                {parts.map((p) => (
                  <div key={p}>
                    <p className="font-mono text-[10px] tracking-[0.2em] uppercase tx2 mb-2">{p}</p>
                    <div className="flex flex-wrap gap-2">
                      {chapters
                        .filter((c) => c.part === p)
                        .flatMap((c) => c.scenes)
                        .map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-1 rounded-md border line-c tx3 text-[13px] hover:tx1 hover:border-[var(--line-2)] transition-colors cursor-default"
                          >
                            {s}
                          </span>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
