import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icons";

/**
 * Атмосфера: мягкий гул и ветер, синтезированные через WebAudio.
 * Без внешних файлов — включается по клику (жест пользователя).
 */
export function AmbientButton() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => undefined);
    };
  }, []);

  const toggle = async () => {
    if (!ctxRef.current) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      ctxRef.current = ctx;

      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      masterRef.current = master;

      // deep drone: two detuned sines
      const droneFreqs = [55, 82.5];
      droneFreqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = f;
        osc.detune.value = i === 0 ? -4 : 5;
        const g = ctx.createGain();
        g.gain.value = i === 0 ? 0.5 : 0.22;
        osc.connect(g).connect(master);
        osc.start();
        nodesRef.current.push(osc);
      });

      // slow shimmer a fifth above
      const shimmer = ctx.createOscillator();
      shimmer.type = "triangle";
      shimmer.frequency.value = 220.5;
      const shG = ctx.createGain();
      shG.gain.value = 0.012;
      const shLfo = ctx.createOscillator();
      shLfo.frequency.value = 0.07;
      const shLfoG = ctx.createGain();
      shLfoG.gain.value = 0.01;
      shLfo.connect(shLfoG).connect(shG.gain);
      shimmer.connect(shG).connect(master);
      shimmer.start();
      shLfo.start();
      nodesRef.current.push(shimmer, shLfo);

      // wind: filtered noise with slow breathing
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
      const windLfo = ctx.createOscillator();
      windLfo.frequency.value = 0.11;
      const windLfoG = ctx.createGain();
      windLfoG.gain.value = 0.035;
      windLfo.connect(windLfoG).connect(nG.gain);
      noise.connect(lp).connect(nG).connect(master);
      noise.start();
      windLfo.start();
      nodesRef.current.push(noise, windLfo);
    }

    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;

    if (on) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      setOn(false);
    } else {
      if (ctx.state === "suspended") await ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 1.6);
      setOn(true);
    }
  };

  return (
    <button
      onClick={toggle}
      className={`group flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-md border transition-all duration-300 ${
        on
          ? "border-gold-500/50 bg-gold-500/10 text-gold-300"
          : "border-line bg-ink-800/40 text-parch-400 hover:text-parch-200 hover:border-fog-500/50"
      }`}
      title={on ? "Выключить атмосферу" : "Включить атмосферу: гул и ветер"}
    >
      <span className="font-mono text-[10px] tracking-[0.22em] uppercase">Атмосфера</span>
      {on ? (
        <span className="flex items-end gap-[3px] h-4" aria-hidden>
          {[0.9, 0.55, 1.1, 0.7].map((d, i) => (
            <span
              key={i}
              className="eq-bar w-[3px] rounded-sm bg-gold-400"
              style={{ height: "100%", animationDuration: `${d}s`, animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </span>
      ) : (
        <Icon name="sound" className="w-4 h-4" />
      )}
    </button>
  );
}
