import { useEffect, useRef } from "react";
import { useSettings } from "../hooks/useSettings";

export const DEFAULT_COVER =
  "https://image.qwenlm.ai/generated-images/113fe3e3-e5c6-432c-bf76-799a79a31303/_result.png";

/**
 * Объёмная книга: CSS-кубоид (обложка, корешок, блок страниц),
 * плавный наклон за курсором и медленное парение.
 */
export function Book3D({ title, author, cover = DEFAULT_COVER }: { title: string; author: string; cover?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const target = useRef({ rx: 6, ry: -17 });
  const cur = useRef({ rx: 6, ry: -17 });
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings.motion) return;
    let raf = 0;
    const loop = () => {
      cur.current.rx += (target.current.rx - cur.current.rx) * 0.07;
      cur.current.ry += (target.current.ry - cur.current.ry) * 0.07;
      if (ref.current) {
        ref.current.style.transform = `rotateX(${cur.current.rx}deg) rotateY(${cur.current.ry}deg)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [settings.motion]);

  return (
    <div
      className="relative"
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el || !settings.motion) return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        target.current = { rx: 6 - py * 16, ry: -17 + px * 22 };
      }}
      onMouseLeave={() => {
        target.current = { rx: 6, ry: -17 };
      }}
    >
      <div className={settings.motion ? "anim-floaty" : ""}>
        <div className="book-stage flex justify-center py-6">
          <div ref={ref} className="book3d" style={{ transform: "rotateX(6deg) rotateY(-17deg)" }}>
            <div className="face f-front cover-skin">
              <img
                src={cover}
                alt="Обложка книги"
                className="absolute inset-0 w-full h-full object-cover opacity-90"
                draggable={false}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/25" />
              <div className="absolute inset-x-0 bottom-0 px-6 pb-6 text-center">
                <div className="ornament-line mb-3" />
                <p
                  className="font-display text-[24px] font-semibold leading-tight tracking-wide text-[#ece3cc]"
                  style={{ textShadow: "0 2px 14px rgba(0,0,0,0.85)" }}
                >
                  {title}
                </p>
                <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#c8a86a] mt-2.5">{author}</p>
              </div>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ boxShadow: "inset 14px 0 26px rgba(0,0,0,0.55), inset -4px 0 12px rgba(0,0,0,0.35)" }}
              />
            </div>
            <div className="face f-back cover-skin" />
            <div className="face f-side f-pages pages-edge" />
            <div className="face f-side f-spine spine-skin flex items-center justify-center">
              <span
                className="font-display text-[15px] font-semibold tracking-[0.18em] text-[#cfc2a2]"
                style={{ writingMode: "vertical-rl", textShadow: "0 1px 6px rgba(0,0,0,.7)" }}
              >
                {title}
              </span>
            </div>
            <div className="face f-cap f-top pages-cap" />
            <div className="face f-cap f-bottom pages-cap" />
          </div>
        </div>
      </div>
      <div className="book-shadow" aria-hidden />
    </div>
  );
}
