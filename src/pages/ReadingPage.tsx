import { useEffect, useRef, useState } from "react";
import type { Tab } from "../types";
import { useLibrary, toRoman, fmtDate, wordCount } from "../hooks/useLibrary";
import { useSettings } from "../hooks/useSettings";
import { Icon } from "../components/Icons";
import { Btn, Ornament } from "../components/ui";

const WIDTHS: Record<string, string> = {
  narrow: "max-w-[620px]",
  normal: "max-w-[740px]",
  wide: "max-w-[880px]",
};

export function ReadingPage({
  chapterId,
  onClose,
  onNavChapter,
  onNav,
}: {
  chapterId: string;
  onClose: () => void;
  onNavChapter: (id: string) => void;
  onNav: (tab: Tab) => void;
}) {
  const lib = useLibrary();
  const { settings, update } = useSettings();
  const [progress, setProgress] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const chapters = lib.chapters;
  const idx = chapters.findIndex((c) => c.id === chapterId);
  const chapter = chapters[idx];
  const prev = idx > 0 ? chapters[idx - 1] : null;
  const next = idx < chapters.length - 1 ? chapters[idx + 1] : null;

  const location = chapter ? lib.locations.find((l) => l.id === chapter.locationId) : null;
  const chars = chapter
    ? chapter.characterIds
        .map((id) => lib.characters.find((c) => c.id === id))
        .filter((c) => !!c)
    : [];

  useEffect(() => {
    lib.openChapter(chapterId);
    scrollerRef.current?.scrollTo({ top: 0 });
    setProgress(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  if (!chapter) {
    return (
      <div className="fixed inset-0 z-[60] bg-app flex items-center justify-center">
        <div className="text-center">
          <p className="tx3 mb-4">Глава не найдена — возможно, она была удалена.</p>
          <Btn onClick={onClose}>Вернуться</Btn>
        </div>
      </div>
    );
  }

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? Math.min(1, el.scrollTop / max) : 0);
  };

  const paragraphs = chapter.content.split(/\n{2,}/);

  return (
    <div className="fixed inset-0 z-[60] bg-app flex flex-col">
      {/* индикатор прочитанного */}
      <div className="absolute top-0 left-0 right-0 h-[3px] z-20">
        <div
          className="h-full bg-[var(--acc)] transition-[width] duration-150"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* шапка чтения */}
      <header className="shrink-0 border-b line-c bg-[color-mix(in_srgb,var(--panel)_75%,transparent)] backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 flex items-center gap-2">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 tx2 hover:tx1 transition-colors text-sm mr-2"
          >
            <Icon name="chevronL" className="w-4 h-4" />
            <span className="hidden sm:inline">Оглавление</span>
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase tx3 truncate">
              {chapter.part} · глава {toRoman(chapter.order + 1)}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {(["md", "lg", "xl"] as const).map((fs) => (
              <button
                key={fs}
                onClick={() => update({ fontScale: fs })}
                className={`px-2 py-1 rounded text-[12px] font-mono transition-colors ${
                  settings.fontScale === fs
                    ? "bg-[color-mix(in_srgb,var(--acc)_18%,transparent)] acc-t"
                    : "tx3 hover:tx1"
                }`}
                title="Размер текста"
              >
                {fs === "md" ? "А" : fs === "lg" ? "А+" : "А++"}
              </button>
            ))}
            <button
              onClick={() => update({ theme: settings.theme === "ink" ? "parchment" : "ink" })}
              className="p-2 tx2 hover:acc-t transition-colors"
              title="Тема чтения"
            >
              <Icon name={settings.theme === "ink" ? "sun" : "moon"} className="w-4.5 h-4.5" />
            </button>
            <button onClick={onClose} className="p-2 tx2 hover:acc-t transition-colors" title="Закрыть">
              <Icon name="close" className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex">
        {/* текст */}
        <div ref={scrollerRef} onScroll={onScroll} className="flex-1 overflow-y-auto">
          <article className={`${WIDTHS[settings.width]} mx-auto px-6 py-14 sm:py-20`}>
            <p className="eyebrow text-center mb-4">{chapter.part}</p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold tx1 text-center leading-tight">
              {toRoman(chapter.order + 1)}. {chapter.title}
            </h1>
            <Ornament className="my-8" />
            <blockquote className="font-display italic text-lg sm:text-xl tx2 text-center leading-relaxed mb-12 px-4">
              {chapter.epigraph}
            </blockquote>
            <div className="prose-fantasy">
              {paragraphs.map((p, i) => (
                <p key={i}>{p.trim()}</p>
              ))}
            </div>
            <Ornament className="my-12" />
            <nav className="flex flex-col sm:flex-row items-stretch gap-3">
              <NavBtn
                dir="prev"
                title={prev ? `${toRoman(prev.order + 1)}. ${prev.title}` : null}
                onClick={prev ? () => onNavChapter(prev.id) : onClose}
                fallbackLabel="К оглавлению"
              />
              <NavBtn
                dir="next"
                title={next ? `${toRoman(next.order + 1)}. ${next.title}` : null}
                onClick={next ? () => onNavChapter(next.id) : onClose}
                fallbackLabel="Конец рукописи"
              />
            </nav>
          </article>
        </div>

        {/* боковая справка */}
        <aside className="hidden xl:block w-72 shrink-0 border-l line-c overflow-y-auto">
          <div className="p-6 space-y-6 sticky top-0">
            <div>
              <p className="eyebrow mb-3">справка к главе</p>
              <dl className="space-y-2 text-sm">
                <Row k="Слов" v={wordCount(chapter.content).toLocaleString("ru-RU")} />
                <Row k="Сцен" v={String(chapter.scenes.length)} />
                <Row k="Обновлено" v={fmtDate(chapter.updatedAt)} />
              </dl>
            </div>
            {location && (
              <div className="panel-in p-4">
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase tx3 mb-2">место действия</p>
                <p className="font-display text-lg font-semibold tx1 mb-2">{location.name}</p>
                <Btn onClick={() => onNav("map")} className="w-full justify-center text-[13px] py-1.5">
                  <Icon name="map" className="w-3.5 h-3.5" /> На карте
                </Btn>
              </div>
            )}
            {chars.length > 0 && (
              <div>
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase tx3 mb-2">в главе</p>
                <div className="space-y-1.5">
                  {chars.map(
                    (c) =>
                      c && (
                        <div key={c.id} className="flex items-center gap-2.5">
                          <span
                            className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center font-display text-[13px] font-semibold"
                            style={{
                              background: `color-mix(in srgb, ${c.color} 20%, transparent)`,
                              border: `1px solid color-mix(in srgb, ${c.color} 55%, transparent)`,
                              color: c.color,
                            }}
                          >
                            {c.name[0]}
                          </span>
                          <span className="tx2 text-sm truncate">{c.name}</span>
                        </div>
                      ),
                  )}
                </div>
              </div>
            )}
            {chapter.scenes.length > 0 && (
              <div>
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase tx3 mb-2">сцены</p>
                <ul className="space-y-1.5">
                  {chapter.scenes.map((s) => (
                    <li key={s} className="tx3 text-[13px] flex gap-2">
                      <Icon name="spark" className="w-3 h-3 mt-1 shrink-0 acc-t" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );

}

function NavBtn({
  dir,
  title,
  onClick,
  fallbackLabel,
}: {
  dir: "prev" | "next";
  title: string | null;
  onClick: () => void;
  fallbackLabel: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 panel-in px-5 py-4 hover:border-[var(--line-2)] transition-colors group ${
        dir === "next" ? "text-right" : "text-left"
      }`}
    >
      <span className={`flex items-center gap-2 tx3 text-[11px] font-mono uppercase tracking-[0.18em] mb-1 ${
        dir === "next" ? "justify-end" : "justify-start"
      }`}>
        {dir === "prev" && <Icon name="chevronL" className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />}
        {dir === "prev" ? "раньше" : "дальше"}
        {dir === "next" && <Icon name="chevronR" className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />}
      </span>
      <span className="font-display text-lg font-medium tx1 block truncate">
        {title ?? fallbackLabel}
      </span>
    </button>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="tx3">{k}</dt>
      <dd className="tx2 font-medium">{v}</dd>
    </div>
  );
}
