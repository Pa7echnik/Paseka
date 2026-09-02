/* ============ Домены данных интерактивной книги ============ */

export type Tab =
  | "home"
  | "characters"
  | "lore"
  | "map"
  | "timeline"
  | "music"
  | "settings";

export interface Chapter {
  id: string;
  order: number;
  part: string;
  title: string;
  epigraph: string;
  content: string;
  locationId: string | null;
  characterIds: string[];
  scenes: string[];
  updatedAt: number;
}

export type CharacterStatus = "alive" | "dead" | "unknown";

export interface Character {
  id: string;
  name: string;
  role: string;
  race: string;
  age: string;
  height: string;
  faction: string;
  status: CharacterStatus;
  color: string;
  sigil: string;
  portrait?: string;
  summary: string;
  bio: string;
  traits: string[];
  goals: string;
  relationships: string;
  notes: string;
}

export type LoreCategory =
  | "mir"
  | "istoriya"
  | "magiya"
  | "fraktsii"
  | "gosudarstva"
  | "religii"
  | "artefakty"
  | "sushchestva"
  | "sobytiya"
  | "khronologiya";

export interface LoreEntry {
  id: string;
  title: string;
  category: LoreCategory;
  content: string;
}

export type LocType = "city" | "port" | "fortress" | "ruins" | "village" | "wilds";
export type LocStatus = "процветает" | "нейтрально" | "в опасности" | "разрушено";

export interface Location {
  id: string;
  name: string;
  type: LocType;
  x: number;
  y: number;
  description: string;
  status: LocStatus;
  characterIds: string[];
  eventIds: string[];
}

export type EventCategory = "история" | "магия" | "войны" | "сюжет";

export interface TimelineEvent {
  id: string;
  title: string;
  era: string;
  yearLabel: string;
  category: EventCategory;
  description: string;
  locationId: string | null;
  importance: 1 | 2 | 3;
}

export type MusicCategory = "тема" | "эмбиент" | "звук";

export interface MusicTrack {
  id: string;
  title: string;
  subtitle: string;
  category: MusicCategory;
  duration: number; // секунды
  /** Путь к файлу в public/ (напр. "/audio/theme.mp3"). "synth:wind" — встроенный синтез. */
  src?: string;
  boundChapterId?: string;
  boundLocationId?: string;
}

export interface PartyState {
  locationId: string | null;
  route: string[];
}

export interface Progress {
  lastOpenedChapterId: string | null;
  readChapterIds: string[];
  updatedAt: number;
}

export type ThemeMode = "ink" | "parchment";
export type FontScale = "md" | "lg" | "xl";
export type ColumnWidth = "narrow" | "normal" | "wide";

export interface Settings {
  theme: ThemeMode;
  fontScale: FontScale;
  width: ColumnWidth;
  motion: boolean;
  volume: number; // 0..100
}

/* ============ Справочники ============ */

export const LOC_TYPES: { id: LocType; label: string }[] = [
  { id: "city", label: "Город" },
  { id: "port", label: "Порт" },
  { id: "fortress", label: "Крепость" },
  { id: "ruins", label: "Руины" },
  { id: "village", label: "Селение" },
  { id: "wilds", label: "Дикие земли" },
];

export const LOC_STATUSES: LocStatus[] = ["процветает", "нейтрально", "в опасности", "разрушено"];

export const LORE_CATEGORIES: { id: LoreCategory; label: string; icon: string }[] = [
  { id: "mir", label: "Мир", icon: "globe" },
  { id: "istoriya", label: "История", icon: "clock" },
  { id: "magiya", label: "Магия", icon: "spark" },
  { id: "fraktsii", label: "Фракции", icon: "shield" },
  { id: "gosudarstva", label: "Государства", icon: "tower" },
  { id: "religii", label: "Религии и культы", icon: "flame" },
  { id: "artefakty", label: "Артефакты", icon: "gem" },
  { id: "sushchestva", label: "Существа и народы", icon: "eye" },
  { id: "sobytiya", label: "Важные события", icon: "star" },
  { id: "khronologiya", label: "Хронология", icon: "route" },
];

export const ERAS = ["Эпоха Рассвета", "Эпоха Пепла", "Тихие годы", "Нынешняя эпоха"];

export const EVENT_CATEGORIES: EventCategory[] = ["история", "магия", "войны", "сюжет"];

export const SIGILS = ["star", "eye", "moon", "flame", "quill", "shield"] as const;

export const CHAR_COLORS = ["#c2875a", "#9fb2bd", "#6f8f77", "#b05a50", "#b09464", "#8a7fb0"];
