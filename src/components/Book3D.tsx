import { useRef, useState } from "react";
import { useLibrary } from "../lib/store";

function CornerOrnament({ rotate }: { rotate: number }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className="absolute w-9 h-9 text-gold-500/70"
      style={{ transform: `rotate(${rotate}deg)` }}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <path d="M2 38V14C2 7.4 7.4 2 14 2h24" strokeLinecap="round" />
      <path d="M2 24c8 0 14-6 14-14" opacity="0.7" strokeLinecap="round" />
      <circle cx="9" cy="9" r="2.2" />
    </svg>
  );
}

function Seal() {
  return (
    <svg viewBox="0 0 120 120" className="w-28 h-28" fill="none" stroke="#d4ab5c" aria-hidden>
      <circle cx="60" cy="60" r="56" strokeWidth="1.4" opacity="0.9" />
      <circle cx="60" cy="60" r="48" strokeWidth="0.8" strokeDasharray="3 6" opacity="0.8" />
      <path
        d="M60 22 L68 48 L95 48 L73 64 L81 90 L60 74 L39 90 L47 64 L25 48 L52 48 Z"
        strokeWidth="1.2"
        opacity="0.95"
      />
      <path d="M60 40v40M45 60h30" strokeWidth="0.8" opacity="0.6" />
      <circle cx="60" cy="60" r="4" fill="#d4ab5c" stroke="none" opacity="0.9" />
    </svg>
  );
}

export function Book3D() {
  const { meta } = useLibrary();
  const stage = useRef<HTMLDivElement>(null);
  const [rot, setRot] = useState({ x: 8, y: -26 });

  return (
    <div
      ref={stage}
      className="book-stage relative flex items-center justify-center py-10 select-none"
      onMouseMove={(e) => {
        const el = stage.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        setRot({ x: 8 - py * 14, y: -26 + px * 22 });
      }}
      onMouseLeave={() => setRot({ x: 8, y: -26 })}
    >
      {/* glow behind book */}
      <div
        className="absolute w-[420px] h-[420px] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(212,171,92,0.22), rgba(95,143,111,0.12) 55%, transparent 70%)",
        }}
      />

      <div className="anim-floaty relative" style={{ transform: "translateZ(0)" }}>
        <div
          className="book3d"
          style={{ transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)` }}
        >
          {/* pages block: right edge */}
          <div className="face f-side f-pages pages-edge" />
          {/* top & bottom page caps */}
          <div className="face f-cap f-top pages-cap" />
          <div className="face f-cap f-bottom pages-cap" />
          {/* spine */}
          <div className="face f-side f-spine spine-leather flex flex-col items-center justify-between py-6">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-gold-500/80" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M12 3l2.2 5 5.3.6-4 3.7 1.1 5.2L12 14.8 7.4 17.5l1.1-5.2-4-3.7 5.3-.6L12 3z" />
            </svg>
            <span
              className="font-display text-gold-300/90 text-lg tracking-[0.35em] uppercase"
              style={{ writingMode: "vertical-rl" }}
            >
              {meta.title}
            </span>
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-gold-500/80" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="12" cy="12" r="8" />
              <path d="m15 9-2 4.5L8.5 15l2-4.5L15 9z" />
            </svg>
          </div>

          {/* back cover */}
          <div className="face f-back cover-leather" />

          {/* front cover */}
          <div className="face f-front cover-leather overflow-hidden">
            {/* frame */}
            <div className="absolute inset-3 border border-gold-500/40 rounded-[4px]" />
            <div className="absolute inset-[18px] border border-gold-500/20 rounded-[3px]" />

            {/* corners */}
            <div className="absolute top-3 left-3 translate-x-[3px] translate-y-[3px]"><CornerOrnament rotate={0} /></div>
            <div className="absolute top-3 right-3 -translate-x-[3px] translate-y-[3px]"><CornerOrnament rotate={90} /></div>
            <div className="absolute bottom-3 right-3 -translate-x-[3px] -translate-y-[3px]"><CornerOrnament rotate={180} /></div>
            <div className="absolute bottom-3 left-3 translate-x-[3px] -translate-y-[3px]"><CornerOrnament rotate={270} /></div>

            {/* clasp */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-16 bg-gradient-to-l from-gold-600/80 to-gold-500/40 rounded-l-sm shadow-[0_0_12px_rgba(212,171,92,0.35)]" />

            {/* content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-9">
              <p className="font-mono text-[9px] tracking-[0.4em] uppercase text-gold-400/80 mb-6">
                {meta.subtitle || "хроники"}
              </p>
              <Seal />
              <h2 className="font-display text-[2.35rem] leading-[1.05] font-semibold text-parch-100 mt-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                {meta.title}
              </h2>
              <div className="flex items-center gap-2 mt-5 text-gold-500/70">
                <span className="ornament-line w-10" />
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                  <path d="M12 4l1.8 6.2L20 12l-6.2 1.8L12 20l-1.8-6.2L4 12l6.2-1.8L12 4z" />
                </svg>
                <span className="ornament-line w-10" />
              </div>
              <p className="font-display italic text-parch-300 text-lg mt-5">{meta.author}</p>
            </div>

            {/* sheen */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(115deg, transparent 30%, rgba(240,231,210,0.06) 45%, transparent 60%)",
              }}
            />
          </div>
        </div>

        <div className="book-shadow" />
      </div>
    </div>
  );
}
