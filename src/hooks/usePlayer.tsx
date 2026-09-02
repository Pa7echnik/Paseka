import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { MusicTrack } from "../types";
import { SEED_TRACKS } from "../data/music";
import { useSettings } from "./useSettings";

interface PlayerApi {
  tracks: MusicTrack[];
  current: MusicTrack | null;
  playing: boolean;
  progress: number;
  play: (id: string) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
}

const Ctx = createContext<PlayerApi | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<{ ctx: AudioContext; master: GainNode } | null>(null);
  const intervalRef = useRef<number | null>(null);
  const nextRef = useRef<() => void>(() => undefined);

  const tracks = SEED_TRACKS;
  const current = tracks.find((t) => t.id === currentId) ?? null;
  const isSynth = current?.src === "synth:wind";
  const isAudio = !!current?.src && current.src !== "synth:wind";

  const ensureAudio = () => {
    if (!audioRef.current) {
      const a = new Audio();
      a.loop = false;
      a.addEventListener("timeupdate", () => setProgress(a.currentTime));
      a.addEventListener("ended", () => nextRef.current());
      audioRef.current = a;
    }
    return audioRef.current;
  };

  const ensureSynth = () => {
    if (synthRef.current) return synthRef.current;
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    [55, 82.5].forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      osc.detune.value = i === 0 ? -4 : 5;
      const g = ctx.createGain();
      g.gain.value = i === 0 ? 0.5 : 0.22;
      osc.connect(g).connect(master);
      osc.start();
    });

    const shimmer = ctx.createOscillator();
    shimmer.type = "triangle";
    shimmer.frequency.value = 220.5;
    const shG = ctx.createGain();
    shG.gain.value = 0.012;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoG = ctx.createGain();
    lfoG.gain.value = 0.01;
    lfo.connect(lfoG).connect(shG.gain);
    shimmer.connect(shG).connect(master);
    shimmer.start();
    lfo.start();

    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 420;
    const nG = ctx.createGain();
    nG.gain.value = 0.05;
    const wLfo = ctx.createOscillator();
    wLfo.frequency.value = 0.11;
    const wLfoG = ctx.createGain();
    wLfoG.gain.value = 0.035;
    wLfo.connect(wLfoG).connect(nG.gain);
    noise.connect(lp).connect(nG).connect(master);
    noise.start();
    wLfo.start();

    synthRef.current = { ctx, master };
    return synthRef.current;
  };

  const stopAll = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    audioRef.current?.pause();
    if (synthRef.current) {
      const { ctx, master } = synthRef.current;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    }
  };

  const step = (dir: 1 | -1) => {
    if (!currentId) return;
    const idx = tracks.findIndex((t) => t.id === currentId);
    const nextTrack = tracks[(idx + dir + tracks.length) % tracks.length];
    setCurrentId(nextTrack.id);
    setProgress(0);
  };

  nextRef.current = () => step(1);

  const play = (id: string) => {
    stopAll();
    setCurrentId(id);
    setProgress(0);
    setPlaying(true);
  };

  const toggle = () => {
    if (!currentId) {
      play(tracks[0].id);
      return;
    }
    setPlaying((p) => {
      if (p) stopAll();
      return !p;
    });
  };

  /* start / stop underlying sources when track or play state changes */
  useEffect(() => {
    stopAll();
    if (!current || !playing) return;

    if (isSynth) {
      const s = ensureSynth();
      void s.ctx.resume();
      s.master.gain.cancelScheduledValues(s.ctx.currentTime);
      s.master.gain.linearRampToValueAtTime((settings.volume / 100) * 0.18, s.ctx.currentTime + 0.8);
      intervalRef.current = window.setInterval(() => setProgress((p) => p + 1), 1000);
    } else if (isAudio && current.src) {
      const a = ensureAudio();
      if (a.src.indexOf(current.src) === -1) a.src = current.src;
      a.volume = settings.volume / 100;
      void a.play().catch(() => undefined);
    } else {
      intervalRef.current = window.setInterval(() => setProgress((p) => p + 1), 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, playing]);

  /* volume */
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = settings.volume / 100;
    if (synthRef.current && playing && isSynth) {
      const { ctx, master } = synthRef.current;
      master.gain.linearRampToValueAtTime((settings.volume / 100) * 0.18, ctx.currentTime + 0.3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.volume]);

  /* auto-next when simulated progress reaches duration */
  useEffect(() => {
    if (current && !isAudio && progress >= current.duration) step(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, currentId]);

  /* cleanup */
  useEffect(() => {
    return () => {
      stopAll();
      audioRef.current?.pause();
      void synthRef.current?.ctx.close().catch(() => undefined);
    };
  }, []);

  const api: PlayerApi = {
    tracks,
    current,
    playing,
    progress,
    play,
    toggle,
    next: () => step(1),
    prev: () => step(-1),
  };

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function usePlayer(): PlayerApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
