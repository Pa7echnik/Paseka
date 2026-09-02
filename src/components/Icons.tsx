import type { ReactNode } from "react";

export type IconName =
  | "book" | "quill" | "map" | "users" | "scroll" | "music" | "clock" | "settings"
  | "play" | "pause" | "next" | "prev" | "volume" | "plus" | "close" | "trash"
  | "edit" | "check" | "star" | "compass" | "route" | "pin" | "search" | "download"
  | "sun" | "moon" | "spark" | "eye" | "flame" | "tower" | "anchor" | "shield"
  | "column" | "house" | "mountain" | "arrow" | "chevronL" | "chevronR" | "globe"
  | "gem" | "info";

export const PATHS: Record<IconName, ReactNode> = {
  book: (
    <>
      <path d="M12 6.5C10.2 4.8 7.4 4.3 4.5 4.6c-.6.1-1 .5-1 1.1v12.2c0 .6.5 1 1.1.9 2.7-.2 5.5.3 7.4 1.7 1.9-1.4 4.7-1.9 7.4-1.7.6.1 1.1-.3 1.1-.9V5.7c0-.6-.4-1-1-1.1-2.9-.3-5.7.2-7.5 1.9z" />
      <path d="M12 6.5v14" />
    </>
  ),
  quill: (
    <>
      <path d="M20 4c-6.5 1-11 4.5-13.5 11L5 19.5" />
      <path d="M20 4c-.5 6.5-4 11-11 13" />
      <path d="M5 19.5c1.5-3 3.5-5.5 6-7.5" />
    </>
  ),
  map: (
    <>
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
      <path d="M9 4v14M15 6v14" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c.6-3.6 2.8-5.5 5.5-5.5s4.9 1.9 5.5 5.5" />
      <circle cx="16.5" cy="9" r="2.4" />
      <path d="M15.7 14.6c2.4.2 4.2 1.9 4.8 4.9" />
    </>
  ),
  scroll: (
    <>
      <path d="M6 4h11a2 2 0 0 1 2 2v1H8" />
      <path d="M8 4a2 2 0 0 0-2 2v12a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-1h11" />
      <path d="M19 6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8" />
      <path d="M10 10h6M10 13h6" />
    </>
  ),
  music: (
    <>
      <path d="M9 18.5V6l11-2v12.5" />
      <circle cx="6.5" cy="18.5" r="2.5" />
      <circle cx="17.5" cy="16.5" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7" />
    </>
  ),
  play: <path d="M8 5.5v13l10-6.5-10-6.5z" />,
  pause: <path d="M7 5h3.4v14H7zM13.6 5H17v14h-3.4z" />,
  next: <path d="M6 5.5v13l8-6.5-8-6.5zM17 5.5v13" />,
  prev: <path d="M18 5.5v13l-8-6.5 8-6.5zM7 5.5v13" />,
  volume: (
    <>
      <path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4z" />
      <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  trash: (
    <>
      <path d="M4 7h16M9.5 7V5h5v2M6.5 7l1 13h9l1-13" />
      <path d="M10 11v5M14 11v5" />
    </>
  ),
  edit: (
    <>
      <path d="M12 20h8" />
      <path d="M16.5 3.5 20.5 7.5 8 20H4v-4L16.5 3.5z" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  star: <path d="M12 3l2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6z" />,
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5z" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="19" r="2.2" />
      <circle cx="18" cy="5" r="2.2" />
      <path d="M8.2 19H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 1 1 13 0c0 5-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l5 5" />
    </>
  ),
  download: <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19h14" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3 7 7M17 17l1.7 1.7M18.7 5.3 17 7M7 17l-1.7 1.7" />
    </>
  ),
  moon: <path d="M20 13.5A8.5 8.5 0 1 1 10.5 4a7 7 0 0 0 9.5 9.5z" />,
  spark: <path d="M12 3l1.6 5.9L19.5 10l-5.9 1.6L12 17.5l-1.6-5.9L4.5 10l5.9-1.1z" />,
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  flame: (
    <>
      <path d="M12 3c.5 4.5 5.5 6 5.5 10.5a5.5 5.5 0 0 1-11 0C6.5 8.5 12 7 12 3z" />
      <path d="M12 21a3.2 3.2 0 0 0 3.2-3.2c0-2-3.2-3-3.2-5-0 2-3.2 3-3.2 5A3.2 3.2 0 0 0 12 21z" />
    </>
  ),
  tower: (
    <>
      <path d="M8 21V9l4-6 4 6v12" />
      <path d="M6 21h12M10 13h4M10 17h4" />
    </>
  ),
  anchor: (
    <>
      <circle cx="12" cy="5.5" r="2.5" />
      <path d="M12 8v12M5 13H3a9 9 0 0 0 18 0h-2M8 20l4-4 4 4" />
    </>
  ),
  shield: <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z" />,
  column: (
    <>
      <path d="M6 21h12M7 18h10M8.5 18V8M15.5 18V8M12 18V8" />
      <path d="M6.5 8h11L12 3z" />
    </>
  ),
  house: (
    <>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 9.5V20h12V9.5" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  mountain: <path d="M3 19 10 6l4 7 2.5-4L21 19H3z" />,
  arrow: <path d="M4 12h15M13 6l6 6-6 6" />,
  chevronL: <path d="M14.5 5 8 12l6.5 7" />,
  chevronR: <path d="M9.5 5 16 12l-6.5 7" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.5 3.8 5.5 3.8 8.5S14.5 18 12 20.5C9.5 18 8.2 15 8.2 12S9.5 6 12 3.5z" />
    </>
  ),
  gem: (
    <>
      <path d="M7 3h10l4 6-9 12L3 9z" />
      <path d="M3 9h18M12 21 8 9l4-6 4 6z" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 7.5v.5" />
    </>
  ),
};

interface IconProps {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}

export function Icon({ name, className = "w-5 h-5", strokeWidth = 1.5 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
