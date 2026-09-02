import { useEffect, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import type { Tab } from "./types";
import { LibraryProvider, useLibrary } from "./hooks/useLibrary";
import { SettingsProvider, useSettings } from "./hooks/useSettings";
import { PlayerProvider, usePlayer } from "./hooks/usePlayer";
import { Atmosphere } from "./components/Atmosphere";
import { Icon } from "./components/Icons";
import type { IconName } from "./components/Icons";
import { HomePage } from "./pages/HomePage";
import { ReadingPage } from "./pages/ReadingPage";
import { CharactersPage } from "./pages/CharactersPage";
import { LorePage } from "./pages/LorePage";
import { MapPage } from "./pages/MapPage";
import { TimelinePage } from "./pages/TimelinePage";
import { MusicPage } from "./pages/MusicPage";
import { SettingsPage } from "./pages/SettingsPage";

const NAV: { id: Tab; label: string; icon: IconName }[] = [
  { id: "home", label: "Книга", icon: "book" },
  { id: "characters", label: "Герои", icon: "users" },
  { id: "lore", label: "Лор", icon: "scroll" },
  { id: "map", label: "Карта", icon: "map" },
  { id: "timeline", label: "Хроника", icon: "clock" },
  { id: "music", label: "Музыка", icon: "music" },
  { id: "settings", label: "Режим", icon: "settings" },
];

export default function App() {
  return (
    <SettingsProvider>
      <LibraryProvider>
        <PlayerProvider>
          <Shell />
        </PlayerProvider>
      </LibraryProvider>
    </SettingsProvider>
  );
}

function Shell() {
  const [tab, setTab] = useState<Tab>("home");
  const [readingId, setReadingId] = useState<string | null>(null);
  const { settings } = useSettings();
  const lib = useLibrary();
  const player = usePlayer();

  const [savedFlash, setSavedFlash] = useState(false);
  useEffect(() => {
    if (!lib.savedAt) return;
    setSavedFlash(true);
    const t = setTimeout(() => setSavedFlash(false), 2400);
    return () => clearTimeout(t);
  }, [lib.savedAt]);

  const goTab = (t: Tab) => {
    setReadingId(null);
    setTab(t);
    window.scrollTo({ top: 0 });
  };

  return (
    <MotionConfig reducedMotion={settings.motion ? "never" : "always"}>
      <div className="min-h-screen bg-app relative">
        <Atmosphere />

        {/* зерно бумаги */}
        <div
          className="fixed inset-0 z-[1] pointer-events-none opacity-[0.045] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")",
          }}
          aria-hidden
        />

        {/* ===== боковая навигация (desktop) ===== */}
        <nav className="hidden md:flex fixed left-0 top-0 h-full w-[86px] z-40 flex-col items-center py-5 border-r line-c bg-[color-mix(in_srgb,var(--panel)_82%,transparent)] backdrop-blur-md">
          <button onClick={() => goTab("home")} className="mb-7 group" title="Песнь Пепла">
            <span className="w-11 h-11 rotate-45 rounded-[10px] border border-[color-mix(in_srgb,var(--gold)_55%,transparent)] flex items-center justify-center group-hover:border-[var(--acc)] transition-colors">
              <Icon name="star" className="w-5 h-5 -rotate-45 acc-t" />
            </span>
          </button>
          <div className="flex flex-col gap-1 w-full px-2.5 flex-1">
            {NAV.map((item) => {
              const active = tab === item.id && !readingId;
              return (
                <button
                  key={item.id}
                  onClick={() => goTab(item.id)}
                  className={`relative flex flex-col items-center gap-1 py-2.5 rounded-lg transition-all duration-200 ${
                    active ? "acc-t bg-[color-mix(in_srgb,var(--acc)_10%,transparent)]" : "tx3 hover:tx1"
                  }`}
                  title={item.label}
                >
                  {active && (
                    <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r bg-[var(--acc)]" />
                  )}
                  <Icon name={item.icon} className="w-5 h-5" />
                  <span className="text-[9px] font-mono tracking-[0.14em] uppercase">{item.label}</span>
                </button>
              );
            })}
          </div>
          <div
            className={`flex flex-col items-center gap-1.5 transition-opacity duration-500 ${savedFlash ? "opacity-100" : "opacity-45"}`}
            title="Все изменения сохраняются локально"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${savedFlash ? "bg-[var(--moss)]" : "bg-[var(--tx-3)]"}`} />
            <span className="text-[8.5px] font-mono tracking-[0.16em] uppercase tx3">
              {savedFlash ? "сохранено" : "автосейв"}
            </span>
          </div>
        </nav>

        {/* ===== верхняя навигация (mobile) ===== */}
        <header className="md:hidden fixed top-0 inset-x-0 z-40 border-b line-c bg-[color-mix(in_srgb,var(--panel)_90%,transparent)] backdrop-blur-md">
          <div className="flex items-center gap-2 px-3 h-13 py-2">
            <button onClick={() => goTab("home")} className="shrink-0">
              <span className="w-8 h-8 rotate-45 rounded-lg border border-[color-mix(in_srgb,var(--gold)_55%,transparent)] flex items-center justify-center">
                <Icon name="star" className="w-3.5 h-3.5 -rotate-45 acc-t" />
              </span>
            </button>
            <div className="flex-1 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1 px-1">
                {NAV.map((item) => {
                  const active = tab === item.id && !readingId;
                  return (
                    <button
                      key={item.id}
                      onClick={() => goTab(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-md whitespace-nowrap text-[13px] transition-colors ${
                        active
                          ? "acc-t bg-[color-mix(in_srgb,var(--acc)_10%,transparent)]"
                          : "tx3"
                      }`}
                    >
                      <Icon name={item.icon} className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </header>

        {/* ===== содержимое ===== */}
        <main className="relative z-10 md:pl-[86px] pt-[56px] md:pt-0">
          <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-10 md:py-14">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                {tab === "home" && <HomePage onRead={setReadingId} onNav={goTab} />}
                {tab === "characters" && <CharactersPage />}
                {tab === "lore" && <LorePage />}
                {tab === "map" && <MapPage onNav={goTab} />}
                {tab === "timeline" && <TimelinePage onNav={goTab} />}
                {tab === "music" && <MusicPage />}
                {tab === "settings" && <SettingsPage />}
              </motion.div>
            </AnimatePresence>

            <footer className="mt-20 pt-8 border-t line-c flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="font-display italic tx2 text-lg">{lib.meta.title} · черновик</span>
              <span className="tx3 text-sm">
                {lib.chapters.length} глав · {lib.characters.length} персонажей · {lib.locations.length} локаций
              </span>
              <span className="tx3 text-[12.5px] ml-auto flex items-center gap-2">
                <Icon name="music" className="w-3.5 h-3.5 acc-t" />
                музыка и темы привязываются к главам и локациям — вкладка «Музыка»
              </span>
            </footer>
          </div>
        </main>

        {/* ===== чтение поверх всего ===== */}
        <AnimatePresence>
          {readingId && (
            <motion.div
              key={readingId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <ReadingPage
                chapterId={readingId}
                onClose={() => setReadingId(null)}
                onNavChapter={setReadingId}
                onNav={goTab}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <MiniPlayer />
      </div>
    </MotionConfig>
  );
}

function MiniPlayer() {
  const player = usePlayer();
  const { current, playing, progress, toggle, next } = player;
  if (!current) return null;

  const pct = Math.min(100, (progress / current.duration) * 100);
  return (
    <div className="fixed z-40 bottom-4 inset-x-4 md:inset-x-auto md:right-6 md:w-[330px]">
      <div className="panel-c shadow-2xl shadow-black/40 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="w-9 h-9 rounded-md border border-[color-mix(in_srgb,var(--gold)_35%,transparent)] bg-[var(--bg-2)] flex items-center justify-center shrink-0">
            <Icon name="music" className="w-4 h-4 tx2" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-medium tx1 truncate">{current.title}</p>
            <p className="tx3 text-[11.5px] truncate">{current.category} · {current.subtitle}</p>
          </div>
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-full bg-[var(--acc)] text-[var(--bg)] flex items-center justify-center hover:bg-[var(--acc-strong)] transition-colors shrink-0"
            title={playing ? "Пауза" : "Играть"}
          >
            <Icon name={playing ? "pause" : "play"} className="w-4 h-4" strokeWidth={2} />
          </button>
          <button onClick={next} className="p-1.5 tx3 hover:tx1 transition-colors shrink-0" title="Дальше">
            <Icon name="next" className="w-4 h-4" />
          </button>
        </div>
        <div className="h-[3px] bg-[var(--line)]">
          <div className="h-full bg-[var(--acc)] transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
