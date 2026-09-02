import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { v4 as uuid } from "uuid";
import type {
  Chapter,
  Character,
  LoreEntry,
  Location,
  TimelineEvent,
  PartyState,
  Progress,
} from "../types";
import { SEED_CHAPTERS } from "../data/chapters";
import { SEED_CHARACTERS } from "../data/characters";
import { SEED_LORE } from "../data/lore";
import { SEED_LOCATIONS } from "../data/locations";
import { SEED_EVENTS } from "../data/timeline";

/* small helper type kept local to avoid polluting public types */
export interface BookMeta {
  title: string;
  subtitle: string;
  author: string;
}

const P = "grim.v2.";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* ignore */
  }
  return fallback;
}

function usePersistent<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => load(key, initial));
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value]);
  return [value, setValue] as const;
}

const SEED_META: BookMeta = {
  title: "Песнь Пепла",
  subtitle: "Хроники Аэлории · книга первая",
  author: "имя автора",
};

const SEED_PARTY: PartyState = { locationId: "loc-moonport", route: ["loc-moonport"] };
const SEED_PROGRESS: Progress = {
  lastOpenedChapterId: "ch-prologue",
  readChapterIds: ["ch-prologue"],
  updatedAt: Date.now(),
};

interface LibraryApi {
  meta: BookMeta;
  chapters: Chapter[];
  characters: Character[];
  lore: LoreEntry[];
  locations: Location[];
  events: TimelineEvent[];
  party: PartyState;
  progress: Progress;
  savedAt: number;

  setMeta: (m: BookMeta) => void;

  addChapter: (c: Omit<Chapter, "id" | "updatedAt">) => Chapter;
  updateChapter: (id: string, patch: Partial<Chapter>) => void;
  deleteChapter: (id: string) => void;

  addCharacter: (c: Omit<Character, "id">) => void;
  updateCharacter: (id: string, patch: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;

  addLore: (e: Omit<LoreEntry, "id">) => void;
  updateLore: (id: string, patch: Partial<LoreEntry>) => void;
  deleteLore: (id: string) => void;

  addLocation: (l: Omit<Location, "id">) => void;
  updateLocation: (id: string, patch: Partial<Location>) => void;
  deleteLocation: (id: string) => void;

  addEvent: (e: Omit<TimelineEvent, "id">) => void;
  deleteEvent: (id: string) => void;

  moveParty: (locationId: string) => void;
  resetRoute: () => void;

  openChapter: (id: string) => void;

  exportData: () => void;
  resetData: () => void;
}

const LibraryContext = createContext<LibraryApi | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [meta, setMeta] = usePersistent<BookMeta>(P + "meta", SEED_META);
  const [chapters, setChapters] = usePersistent<Chapter[]>(P + "chapters", SEED_CHAPTERS);
  const [characters, setCharacters] = usePersistent<Character[]>(P + "characters", SEED_CHARACTERS);
  const [lore, setLore] = usePersistent<LoreEntry[]>(P + "lore", SEED_LORE);
  const [locations, setLocations] = usePersistent<Location[]>(P + "locations", SEED_LOCATIONS);
  const [events, setEvents] = usePersistent<TimelineEvent[]>(P + "events", SEED_EVENTS);
  const [party, setParty] = usePersistent<PartyState>(P + "party", SEED_PARTY);
  const [progress, setProgress] = usePersistent<Progress>(P + "progress", SEED_PROGRESS);

  const [savedAt, setSavedAt] = useState(0);
  const booted = useRef(false);
  useEffect(() => {
    if (!booted.current) {
      booted.current = true;
      return;
    }
    setSavedAt(Date.now());
  }, [meta, chapters, characters, lore, locations, events, party, progress]);

  const api: LibraryApi = {
    meta,
    chapters: [...chapters].sort((a, b) => a.order - b.order),
    characters,
    lore,
    locations,
    events,
    party,
    progress,
    savedAt,

    setMeta,

    addChapter: (c) => {
      const ch: Chapter = { ...c, id: uuid(), updatedAt: Date.now() };
      setChapters((prev) => [...prev, ch]);
      return ch;
    },
    updateChapter: (id, patch) =>
      setChapters((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c)),
      ),
    deleteChapter: (id) => setChapters((prev) => prev.filter((c) => c.id !== id)),

    addCharacter: (c) => setCharacters((prev) => [...prev, { ...c, id: uuid() }]),
    updateCharacter: (id, patch) =>
      setCharacters((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),
    deleteCharacter: (id) => setCharacters((prev) => prev.filter((c) => c.id !== id)),

    addLore: (e) => setLore((prev) => [...prev, { ...e, id: uuid() }]),
    updateLore: (id, patch) =>
      setLore((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e))),
    deleteLore: (id) => setLore((prev) => prev.filter((e) => e.id !== id)),

    addLocation: (l) => setLocations((prev) => [...prev, { ...l, id: uuid() }]),
    updateLocation: (id, patch) =>
      setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l))),
    deleteLocation: (id) => {
      setLocations((prev) => prev.filter((l) => l.id !== id));
      setParty((prev) => ({
        locationId: prev.locationId === id ? null : prev.locationId,
        route: prev.route.filter((r) => r !== id),
      }));
    },

    addEvent: (e) => setEvents((prev) => [...prev, { ...e, id: uuid() }]),
    deleteEvent: (id) => setEvents((prev) => prev.filter((e) => e.id !== id)),

    moveParty: (locationId) =>
      setParty((prev) => ({
        locationId,
        route:
          prev.route[prev.route.length - 1] === locationId
            ? prev.route
            : [...prev.route, locationId],
      })),
    resetRoute: () =>
      setParty((prev) => ({
        locationId: prev.locationId,
        route: prev.locationId ? [prev.locationId] : [],
      })),

    openChapter: (id) =>
      setProgress((p) => ({
        lastOpenedChapterId: id,
        readChapterIds: p.readChapterIds.includes(id) ? p.readChapterIds : [...p.readChapterIds, id],
        updatedAt: Date.now(),
      })),

    exportData: () => {
      const data = { meta, chapters, characters, lore, locations, events, party, progress };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pesn-pepla-dannye.json";
      a.click();
      URL.revokeObjectURL(url);
    },

    resetData: () => {
      try {
        Object.keys(localStorage)
          .filter((k) => k.startsWith(P))
          .forEach((k) => localStorage.removeItem(k));
      } catch {
        /* ignore */
      }
      window.location.reload();
    },
  };

  return <LibraryContext.Provider value={api}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryApi {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
}

/* ============ helpers ============ */

export function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function toRoman(n: number): string {
  const map: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let out = "";
  let v = n;
  for (const [val, sym] of map) {
    while (v >= val) {
      out += sym;
      v -= val;
    }
  }
  return out || "0";
}

export function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}


