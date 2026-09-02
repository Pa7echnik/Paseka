import type { MusicTrack } from "../types";

/**
 * Демо-список тем. Чтобы подключить настоящий трек:
 * положите файл в public/audio/ и укажите src: "/audio/my-theme.mp3".
 * "synth:wind" — встроенный синтез (WebAudio), работает без файлов.
 */
export const SEED_TRACKS: MusicTrack[] = [
  {
    id: "tr-wind",
    title: "Гул ветра над гаванью",
    subtitle: "встроенный синтез · WebAudio",
    category: "эмбиент",
    duration: 300,
    src: "synth:wind",
    boundLocationId: "loc-moonport",
  },
  {
    id: "tr-moonport",
    title: "Тема Лунного порта",
    subtitle: "основная тема города",
    category: "тема",
    duration: 214,
    src: `${import.meta.env.BASE_URL}audio/0808.MP3`,
    boundLocationId: "loc-moonport",
  },
  {
  id: "tr-lullaby",
  },
  },
  {
    id: "tr-lullaby",
    title: "Пепельная колыбельная",
    subtitle: "звучит в прологе",
    category: "тема",
    duration: 187,
    boundChapterId: "ch-prologue",
  },
  {
    id: "tr-hushwood",
    title: "Шёпот-лес",
    subtitle: "звук отстаёт на день",
    category: "эмбиент",
    duration: 262,
    boundLocationId: "loc-hushwood",
  },
  {
    id: "tr-march",
    title: "Алый марш",
    subtitle: "патрули Договора",
    category: "тема",
    duration: 173,
    boundLocationId: "loc-grimvald",
  },
  {
    id: "tr-piers",
    title: "Скрип девятого причала",
    subtitle: "полевая запись · заглушка",
    category: "звук",
    duration: 96,
    boundLocationId: "loc-moonport",
  },
];
