export type TabId = "book" | "characters" | "lore" | "map";

export interface BookMeta {
  title: string;
  subtitle: string;
  author: string;
}

export interface Chapter {
  id: string;
  title: string;
  epigraph: string;
  content: string;
  updatedAt: number;
}

export type CharStatus = "alive" | "dead" | "unknown";
export type SigilShape = "star" | "moon" | "diamond" | "sword" | "flame" | "eye";

export interface Character {
  id: string;
  name: string;
  role: string;
  status: CharStatus;
  color: string;
  sigil: SigilShape;
  traits: string[];
  bio: string;
}

export type LoreCategory =
  | "history"
  | "magic"
  | "peoples"
  | "places"
  | "factions"
  | "artifacts";

export interface LoreEntry {
  id: string;
  title: string;
  category: LoreCategory;
  content: string;
}

export type LocType = "city" | "port" | "fortress" | "ruins" | "village" | "wilds";

export interface Location {
  id: string;
  name: string;
  type: LocType;
  x: number;
  y: number;
  description: string;
}

export interface PartyState {
  locationId: string | null;
  route: string[];
}

export const LORE_CATEGORIES: { id: LoreCategory; label: string }[] = [
  { id: "history", label: "Эпохи и история" },
  { id: "magic", label: "Магия и Плетение" },
  { id: "peoples", label: "Народы" },
  { id: "places", label: "Места" },
  { id: "factions", label: "Фракции" },
  { id: "artifacts", label: "Артефакты" },
];

export const LOC_TYPES: { id: LocType; label: string }[] = [
  { id: "city", label: "Город" },
  { id: "port", label: "Порт" },
  { id: "fortress", label: "Крепость" },
  { id: "ruins", label: "Руины" },
  { id: "village", label: "Селение" },
  { id: "wilds", label: "Дикие земли" },
];

export const STATUS_LABELS: Record<CharStatus, string> = {
  alive: "Жив(а)",
  dead: "Погиб(ла)",
  unknown: "Судьба неизвестна",
};

export const CHAR_COLORS = [
  "#d4ab5c",
  "#86b28f",
  "#7fa3b5",
  "#d47a4e",
  "#b48ead",
  "#c9c06f",
];
