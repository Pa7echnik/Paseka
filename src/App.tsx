import { useState } from "react";
import { LibraryProvider, useLibrary } from "./lib/store";
import type { TabId } from "./lib/types";
import { Background } from "./components/Background";
import { Icon } from "./components/Icons";
import type { IconName } from "./components/Icons";
import { AmbientButton } from "./components/AmbientButton";
import { ChronicleTab } from "./components/tabs/ChronicleTab";
import { CharactersTab } from "./components/tabs/CharactersTab";
import { LoreTab } from "./components/tabs/LoreTab";
import { MapTab } from "./components/tabs/MapTab";

const TABS: { id: TabId; label: string; icon: IconName }[] = [
  { id: "book", label: "Книга", icon: "book" },
  { id: "characters", label: "Персонажи", icon: "helm" },
  { id: "lore", label: "Лор мира", icon: "scroll" },
  { id: "map", label: "Карта", icon: "compass" },
];

function SaveBadge() {
  const { savedAt } = useLibrary();
  if (!savedAt) return null;
  return (
    <span key={savedAt} className="anim-save hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] uppercase text-fog-300">
      <Icon name="check" className="w-3.5 h-3.5" />
      сохранено {new Date(savedAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
    </span>
  );
}

function Shell() {
  const { meta } = useLibrary();
  const [tab, setTab] = useState<TabId>("book");

  return (
    <div className="relative min-h-screen">
      <Background />

      {/* ===== header ===== */}
      <header className="sticky top-0 z-40 border-b border-line bg-ink-950/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <button onClick={() => setTab("book")} className="flex items-center gap-3 shrink-0 group">
            <span className="w-9 h-9 rounded-md border border-gold-500/50 bg-gold-500/10 flex items-center justify-center text-gold-300 group-hover:bg-gold-500/20 group-hover:shadow-[0_0_18px_rgba(212,171,92,0.25)] transition-all">
              <Icon name="book" className="w-5 h-5" />
            </span>
            <span className="hidden md:block text-left leading-tight">
              <span className="block font-mono text-[9px] tracking-[0.3em] uppercase text-parch-400">Гримуар автора</span>
              <span className="block font-display text-lg font-semibold text-parch-100">{meta.title}</span>
            </span>
          </button>

          <nav className="flex items-center gap-1 mx-auto overflow-x-auto no-scrollbar">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-md text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                    active ? "text-gold-200" : "text-parch-400 hover:text-parch-100"
                  }`}
                >
                  <Icon name={t.icon} className={`w-4 h-4 ${active ? "text-gold-400" : ""}`} />
                  {t.label}
                  <span
                    className={`absolute left-3 right-3 -bottom-[13px] h-[2px] rounded-full bg-gradient-to-r from-transparent via-gold-400 to-transparent transition-opacity duration-300 ${
                      active ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <SaveBadge />
            <AmbientButton />
          </div>
        </div>
      </header>

      {/* ===== content ===== */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-24">
        <div key={tab}>
          {tab === "book" && <ChronicleTab onNavigate={setTab} />}
          {tab === "characters" && <CharactersTab />}
          {tab === "lore" && <LoreTab />}
          {tab === "map" && <MapTab />}
        </div>
      </main>

      {/* ===== footer ===== */}
      <footer className="relative z-10 border-t border-line bg-ink-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-display italic text-parch-300 text-lg">
            «Карта — это обещание дороги, а дорога — обещание истории».
          </p>
          <div className="text-center sm:text-right">
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-parch-400">
              Гримуар автора · всё хранится в вашем браузере
            </p>
            <p className="font-mono text-[10px] tracking-[0.15em] text-parch-400/70 mt-1.5">
              впереди: музыкальные темы к главам и звуки локаций
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LibraryProvider>
      <Shell />
    </LibraryProvider>
  );
}
