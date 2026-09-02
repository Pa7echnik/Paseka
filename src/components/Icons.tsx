import type { ReactNode } from "react";

interface IconProps {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}

export type IconName =
  | "quill" | "helm" | "scroll" | "compass" | "plus" | "close" | "edit"
  | "trash" | "star" | "moon" | "diamond" | "sword" | "flame" | "eye"
  | "anchor" | "tower" | "shield" | "column" | "house" | "mountain"
  | "hourglass" | "spark" | "banner" | "gem" | "pin" | "arrow" | "book"
  | "sound" | "route" | "check";

export const PATHS: Record<IconName, ReactNode> = {
  quill: (
    <>
      <path d="M20.2 3.8c-4.8.4-8.8 2.3-11.6 5.6-1.9 2.2-3 5-3.4 8.3l-.5 3.6 3.6-.6c3.3-.5 6.1-1.7 8.3-3.6 3.3-2.9 5.2-7 5.6-11.7l.2-1.8-2.2.2z" />
      <path d="M4.5 19.5 13 11" />
      <path d="M9.5 15.5c2.6.3 5-.4 7-2" />
    </>
  ),
  helm: (
    <>
      <path d="M4.5 13.5a7.5 7.5 0 0 1 15 0v5.5h-15v-5.5z" />
      <path d="M12 3.5v3" />
      <path d="M8 14.5h2.2v2.5H8zM13.8 14.5H16v2.5h-2.2z" />
      <path d="M4.5 19h15" />
    </>
  ),
  scroll: (
    <>
      <path d="M7 4.5h10.5a2.5 2.5 0 0 1 2.5 2.5v10a2.5 2.5 0 0 1-2.5 2.5H8.5A2.5 2.5 0 0 1 6 17V7a2.5 2.5 0 0 0-2.5-2.5H7z" />
      <path d="M3.5 4.5A2.5 2.5 0 0 1 6 7" />
      <path d="M9.5 9.5h6M9.5 12.5h6M9.5 15.5h3.5" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2z" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  edit: (
    <>
      <path d="m14.5 5.5 4 4L8 20l-4.6 1L4.5 16.5 15 6z" />
      <path d="m13 7 4 4" />
    </>
  ),
  trash: (
    <>
      <path d="M5 7h14M9.5 7V4.8A1.3 1.3 0 0 1 10.8 3.5h2.4a1.3 1.3 0 0 1 1.3 1.3V7" />
      <path d="M6.5 7 7.4 19a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5L17.5 7" />
      <path d="M10 11v5.5M14 11v5.5" />
    </>
  ),
  star: <path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.3l6.1-.7L12 3z" />,
  moon: <path d="M19.5 13.5A8 8 0 1 1 10.5 4a6.5 6.5 0 0 0 9 9.5z" />,
  diamond: <path d="M12 3.5 19 12l-7 8.5L5 12l7-8.5z" />,
  sword: (
    <>
      <path d="M19.5 4.5 9 15" />
      <path d="M19.5 4.5h-4M19.5 4.5v4" />
      <path d="m11.5 12.5-5 5M6 13.5l4.5 4.5" />
      <path d="m4.5 19.5 1.5-1.5" />
    </>
  ),
  flame: (
    <path d="M12 3.5c1 2.8 4.5 4.6 4.5 8.5a4.5 4.5 0 0 1-9 0c0-1.6.6-2.9 1.5-4 .3 1 .8 1.6 1.5 2C10.3 7.6 10.8 5.4 12 3.5z" />
  ),
  eye: (
    <>
      <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  anchor: (
    <>
      <circle cx="12" cy="5.5" r="2.2" />
      <path d="M12 7.7V20" />
      <path d="M8 10h8" />
      <path d="M4.5 13.5C5 17.5 8 20 12 20s7-2.5 7.5-6.5L17 15.5M7 15.5 4.5 13.5" />
    </>
  ),
  tower: (
    <>
      <path d="M7 20V8.5L12 5l5 3.5V20" />
      <path d="M5 20h14" />
      <path d="M7 8.5h10" />
      <path d="M10.5 20v-4a1.5 1.5 0 0 1 3 0v4" />
      <path d="M9.5 11.5h1.5M13 11.5h1.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5 19 6v6c0 4.5-3 7.5-7 8.5-4-1-7-4-7-8.5V6l7-2.5z" />
      <path d="M12 7v6M9 9.5h6" />
    </>
  ),
  column: (
    <>
      <path d="M6 20h12M7 17.5h10" />
      <path d="M8.5 17.5V8M12 17.5V9.5M15.5 17.5V8" />
      <path d="M7 8h11M7.5 5.5h10L19 8H5l2.5-2.5z" />
    </>
  ),
  house: (
    <>
      <path d="m4.5 11 7.5-6.5L19.5 11" />
      <path d="M6.5 10v9.5h11V10" />
      <path d="M10.5 19.5v-5h3v5" />
    </>
  ),
  mountain: (
    <>
      <path d="m3 19 6-11 3.5 6L15 9l6 10H3z" />
      <path d="M8 11.5 9.5 13l1.5-1.5" />
    </>
  ),
  hourglass: (
    <>
      <path d="M7 3.5h10M7 20.5h10" />
      <path d="M8 3.5v2.8c0 2.6 4 3.4 4 5.7s-4 3.1-4 5.7v2.8M16 3.5v2.8c0 2.6-4 3.4-4 5.7s4 3.1 4 5.7v2.8" />
    </>
  ),
  spark: <path d="M12 3c.7 4.8 4.2 8.3 9 9-4.8.7-8.3 4.2-9 9-.7-4.8-4.2-8.3-9-9 4.8-.7 8.3-4.2 9-9z" />,
  banner: (
    <>
      <path d="M6 3.5v17" />
      <path d="M6 4.5h12l-3 4 3 4H6" />
    </>
  ),
  gem: (
    <>
      <path d="M7 4.5h10L21 9.5 12 20 3 9.5 7 4.5z" />
      <path d="M3 9.5h18M9.5 4.5 8 9.5l4 10.5 4-10.5-1.5-5" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.4" />
    </>
  ),
  arrow: <path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" />,
  book: (
    <>
      <path d="M12 6.5C10 4.8 7 4.3 4 4.5v13.8c3-.2 6 .3 8 2 2-1.7 5-2.2 8-2V4.5c-3-.2-6 .3-8 2z" />
      <path d="M12 6.5v13.8" />
    </>
  ),
  sound: (
    <>
      <path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4z" />
      <path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" />
    </>
  ),
  route: (
    <>
      <circle cx="5.5" cy="18.5" r="2" />
      <circle cx="18.5" cy="5.5" r="2" />
      <path d="M7.5 18.5h6a3.5 3.5 0 0 0 0-7h-3a3.5 3.5 0 0 1 0-7h6" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
};

export function Icon({ name, className = "w-5 h-5", strokeWidth = 1.6 }: IconProps) {
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
