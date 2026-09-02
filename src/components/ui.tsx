import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Icon } from "./Icons";

/* ---------------- Scroll reveal ---------------- */

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("is-in");
            io.disconnect();
          }
        });
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ "--rv-delay": `${delay}ms` } as CSSProperties}>
      {children}
    </div>
  );
}

/* ---------------- 3D tilt ---------------- */

export function Tilt({
  children,
  max = 9,
  className = "",
  scale = 1.02,
}: {
  children: ReactNode;
  max?: number;
  className?: string;
  scale?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ rx: 0, ry: 0, s: 1 });

  return (
    <div
      ref={ref}
      className={className}
      style={{ perspective: 900 }}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        setT({ rx: -py * max * 2, ry: px * max * 2, s: scale });
      }}
      onMouseLeave={() => setT({ rx: 0, ry: 0, s: 1 })}
    >
      <div
        style={{
          transform: `rotateX(${t.rx}deg) rotateY(${t.ry}deg) scale(${t.s})`,
          transition: "transform 0.18s ease-out",
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ---------------- Modal ---------------- */

export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-[3px]" onMouseDown={onClose} />
      <div
        className={`panel panel-corner relative z-10 w-full ${wide ? "max-w-2xl" : "max-w-lg"} my-8 shadow-2xl shadow-black/60 tab-in`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-line">
          <h3 className="font-display text-2xl font-semibold text-parch-100">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-parch-400 hover:text-gold-300 transition-colors"
            aria-label="Закрыть"
          >
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ---------------- Buttons ---------------- */

export function Btn({
  children,
  onClick,
  variant = "ghost",
  className = "",
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "gold" | "ghost" | "danger";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const base =
    "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold tracking-wide transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none";
  const styles = {
    gold: "bg-gold-500/15 text-gold-300 border border-gold-500/45 hover:bg-gold-500/25 hover:border-gold-400 hover:shadow-[0_0_22px_rgba(212,171,92,0.18)] active:translate-y-px",
    ghost:
      "text-parch-300 border border-line bg-ink-800/40 hover:text-parch-100 hover:border-fog-500/60 hover:bg-ink-700/60 active:translate-y-px",
    danger:
      "text-blood border border-blood/40 bg-blood/10 hover:bg-blood/20 hover:border-blood/70 active:translate-y-px",
  } as const;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}

/* Two-step inline confirm */
export function ConfirmBtn({
  onConfirm,
  label,
  confirmLabel = "Точно?",
  className = "",
}: {
  onConfirm: () => void;
  label: ReactNode;
  confirmLabel?: string;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 2600);
    return () => clearTimeout(t);
  }, [armed]);

  return (
    <button
      onClick={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
        } else {
          setArmed(true);
        }
      }}
      className={`inline-flex items-center gap-1.5 transition-all duration-200 ${
        armed ? "text-blood" : "text-parch-400 hover:text-blood"
      } ${className}`}
      title="Удалить"
    >
      {armed ? (
        <span className="text-xs font-semibold">{confirmLabel}</span>
      ) : (
        <Icon name="trash" className="w-4 h-4" />
      )}
      {!armed && <span className="sr-only">{confirmLabel}</span>}
      {armed ? null : label}
    </button>
  );
}

/* ---------------- Section heading ---------------- */

export function SectionHead({
  eyebrow,
  title,
  sub,
  action,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-gold-400/90 mb-2">{eyebrow}</p>
        <h2 className="font-display text-4xl sm:text-5xl font-semibold text-parch-100 leading-[1.05]">{title}</h2>
        {sub && <p className="mt-3 text-parch-400 max-w-xl leading-relaxed">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------------- Form bits ---------------- */

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block mb-4">
      <span className="block font-mono text-[10px] tracking-[0.25em] uppercase text-parch-400 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden>
      <span className="ornament-line flex-1" />
      <Icon name="spark" className="w-3.5 h-3.5 text-gold-500/70" />
      <span className="ornament-line flex-1" />
    </div>
  );
}
