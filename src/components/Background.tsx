import { useMemo } from "react";
import type { CSSProperties } from "react";

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function Background() {
  const stars = useMemo(() => {
    const rnd = seeded(42);
    return Array.from({ length: 70 }, (_, i) => ({
      id: i,
      x: rnd() * 100,
      y: rnd() * 60,
      s: rnd() * 1.8 + 0.6,
      d: rnd() * 6 + 4,
      o: rnd() * 0.5 + 0.2,
    }));
  }, []);

  const embers = useMemo(() => {
    const rnd = seeded(7);
    return Array.from({ length: 16 }, (_, i) => ({
      id: i,
      x: rnd() * 100,
      delay: rnd() * 14,
      dur: rnd() * 12 + 12,
      o: rnd() * 0.45 + 0.25,
      dx: (rnd() - 0.5) * 90,
      size: rnd() * 2.5 + 1.5,
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
      {/* base wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 75% -10%, #16241d 0%, #0c1310 55%), radial-gradient(80% 60% at 10% 100%, #101d1a 0%, transparent 60%), #0c1310",
        }}
      />

      {/* drifting mist bands */}
      <div
        className="absolute -inset-[20%] anim-drift-a opacity-[0.16]"
        style={{
          background:
            "radial-gradient(45% 30% at 30% 35%, rgba(95,143,111,0.5), transparent 70%), radial-gradient(40% 25% at 70% 65%, rgba(212,171,92,0.28), transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute -inset-[20%] anim-drift-b opacity-[0.12]"
        style={{
          background:
            "radial-gradient(50% 35% at 65% 25%, rgba(127,163,181,0.4), transparent 70%), radial-gradient(35% 28% at 25% 80%, rgba(95,143,111,0.4), transparent 70%)",
          filter: "blur(70px)",
        }}
      />

      {/* stars */}
      {stars.map((st) => (
        <span
          key={st.id}
          className="absolute rounded-full bg-parch-100"
          style={{
            left: `${st.x}%`,
            top: `${st.y}%`,
            width: st.s,
            height: st.s,
            opacity: st.o,
            animation: `twinkle ${st.d}s ease-in-out ${st.id * 0.3}s infinite`,
          }}
        />
      ))}

      {/* floating embers */}
      {embers.map((e) => (
        <span
          key={e.id}
          className="absolute rounded-full"
          style={{
            left: `${e.x}%`,
            bottom: "-2vh",
            width: e.size,
            height: e.size,
            background: "radial-gradient(circle, #e3c27d, #c0603e 70%)",
            boxShadow: "0 0 8px rgba(212,171,92,0.5)",
            animation: `ember-up ${e.dur}s linear ${e.delay}s infinite`,
            opacity: 0,
            "--ember-o": e.o,
            "--ember-x": `${e.dx}px`,
          } as CSSProperties}
        />
      ))}

      {/* slow rune ring, top-right */}
      <svg
        viewBox="0 0 400 400"
        className="absolute -top-40 -right-40 w-[560px] h-[560px] opacity-[0.07] anim-spin-slower"
        fill="none"
        stroke="#d4ab5c"
      >
        <circle cx="200" cy="200" r="196" strokeWidth="1" />
        <circle cx="200" cy="200" r="150" strokeWidth="0.6" strokeDasharray="4 10" />
        <circle cx="200" cy="200" r="110" strokeWidth="0.6" />
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2;
          const x1 = 200 + Math.cos(a) * 170;
          const y1 = 200 + Math.sin(a) * 170;
          const x2 = 200 + Math.cos(a) * 196;
          const y2 = 200 + Math.sin(a) * 196;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="0.8" />;
        })}
        <path d="M200 60 L226 174 L340 200 L226 226 L200 340 L174 226 L60 200 L174 174 Z" strokeWidth="0.7" />
      </svg>

      {/* faint rune ring, bottom-left */}
      <svg
        viewBox="0 0 400 400"
        className="absolute -bottom-48 -left-48 w-[520px] h-[520px] opacity-[0.05] anim-spin-slow"
        fill="none"
        stroke="#86b28f"
      >
        <circle cx="200" cy="200" r="190" strokeWidth="1" strokeDasharray="2 8" />
        <circle cx="200" cy="200" r="130" strokeWidth="0.7" />
        <path d="M200 80 L304 260 L96 260 Z" strokeWidth="0.7" />
      </svg>

      {/* grain */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")",
        }}
      />

      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 70% at 50% 30%, transparent 50%, rgba(8,12,10,0.75) 100%)",
        }}
      />
    </div>
  );
}
