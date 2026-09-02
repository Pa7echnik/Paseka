import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Settings } from "../types";

const KEY = "grim.v2.settings";

function defaults(): Settings {
  let reduce = false;
  try {
    reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    /* ignore */
  }
  return { theme: "ink", fontScale: "lg", width: "normal", motion: !reduce, volume: 60 };
}

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaults(), ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    /* ignore */
  }
  return defaults();
}

interface SettingsApi {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
}

const Ctx = createContext<SettingsApi | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load);

  useEffect(() => {
    const el = document.documentElement;
    el.dataset.theme = settings.theme;
    el.dataset.fs = settings.fontScale;
    el.dataset.motion = settings.motion ? "on" : "off";
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings]);

  const api: SettingsApi = {
    settings,
    update: (patch) => setSettings((s) => ({ ...s, ...patch })),
  };

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useSettings(): SettingsApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
