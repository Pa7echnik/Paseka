import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { v4 as uuid } from "uuid";
import type {
  BookMeta,
  Chapter,
  Character,
  LoreEntry,
  Location,
  PartyState,
} from "./types";
import {
  SEED_CHAPTERS,
  SEED_CHARACTERS,
  SEED_LORE,
  SEED_LOCATIONS,
  SEED_META,
  SEED_PARTY,
} from "./seed";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function usePersistent<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => load(key, initial));
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable */
    }
  }, [key, value]);
  return [value, setValue] as const;
}

interface LibraryApi {
  meta: BookMeta;
  chapters: Chapter[];
  characters: Character[];
  lore: LoreEntry[];
  locations: Location[];
  party: PartyState;
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

  moveParty: (locationId: string) => void;
  resetRoute: () => void;
}

const LibraryContext = createContext<LibraryApi | null>(null);

const P = "grimoire.v1.";

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [meta, setMeta] = usePersistent<BookMeta>(P + "meta", SEED_META);
  const [chapters, setChapters] = usePersistent<Chapter[]>(P + "chapters", SEED_CHAPTERS);
  const [characters, setCharacters] = usePersistent<Character[]>(P + "characters", SEED_CHARACTERS);
  const [lore, setLore] = usePersistent<LoreEntry[]>(P + "lore", SEED_LORE);
  const [locations, setLocations] = usePersistent<Location[]>(P + "locations", SEED_LOCATIONS);
  const [party, setParty] = usePersistent<PartyState>(P + "party", SEED_PARTY);

  const [savedAt, setSavedAt] = useState(0);
  const booted = useRef(false);
  useEffect(() => {
    if (!booted.current) {
      booted.current = true;
      return;
    }
    setSavedAt(Date.now());
  }, [meta, chapters, characters, lore, locations, party]);

  const api: LibraryApi = {
    meta,
    chapters: [...chapters].sort((a, b) => a.updatedAt - b.updatedAt),
    characters,
    lore,
    locations,
    party,
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
  };

  return <LibraryContext.Provider value={api}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryApi {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
}

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
  return out || "I";
}
