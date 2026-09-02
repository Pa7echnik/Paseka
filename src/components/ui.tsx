import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Icon } from "./Icons";
import type { IconName } from "./Icons";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ---------------- Scroll reveal ---------------- */

export function Reveal({
  children,
  delay = 0,
  className = "",
  y = 24,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.65, delay: delay / 1000, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- Ink line-mask title reveal ---------------- */

export function InkTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.span
      className={`block overflow-hidden ${className}`}
      initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0.4 }}
      whileInView={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 1, ease: EASE }}
    >
      {children}
    </motion.span>
  );
}

/* ---------------- 3D tilt ---------------- */

export function Tilt({
  children,
  max = 7,
  className = "",
}: {
  children: ReactNode;
  max?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ rx: 0, ry: 0 });

  return (
    <div
      ref={ref}
      className={className}
      style={{ perspective: 1000 }}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        setT({ rx: -py * max, ry: px * max });
      }}
      onMouseLeave={() => setT({ rx: 0, ry: 0 })}
    >
      <div
        style={{
          transform: `rotateX(${t.rx}deg) rotateY(${t.ry}deg)`,
          transition: "transform 0.2s ease-out",
          transformStyle: "preserve-3d",
          height: "100%",
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
      className="fixed inset-0 z-[70] flex items-start justify-center p-4 overflow-y-auto"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-[3px]" onMouseDown={onClose} />
      <div
        className={`panel-c panel-corner relative z-10 w-full ${wide ? "max-w-2xl" : "max-w-lg"} my-10 shadow-2xl shadow-black/50`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b line-c">
          <h3 className="font-display text-2xl font-semibold tx1">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 tx3 hover:acc-t transition-colors"
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
  variant?: "accent" | "ghost" | "danger";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold tracking-wide transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none active:translate-y-px";
  const styles = {
    accent:
      "text-[var(--bg)] bg-[var(--acc)] border border-[var(--acc)] hover:bg-[var(--acc-strong)] hover:border-[var(--acc-strong)] hover:shadow-[0_4px_24px_-6px_var(--acc)]",
    ghost:
      "tx2 border line-c bg-[color-mix(in_srgb,var(--panel)_60%,transparent)] hover:tx1 hover:border-[var(--line-2)]",
    danger:
      "text-[var(--danger)] border border-[color-mix(in_srgb,var(--danger)_45%,transparent)] bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] hover:bg-[color-mix(in_srgb,var(--danger)_20%,transparent)]",
  } as const;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}

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
        armed ? "text-[var(--danger)]" : "tx3 hover:text-[var(--danger)]"
      } ${className}`}
    >
      {armed ? <span className="text-xs font-semibold">{confirmLabel}</span> : <Icon name="trash" className="w-4 h-4" />}
      {!armed && label}
    </button>
  );
}

/* ---------------- Chips & controls ---------------- */

export function Chip({
  active,
  onClick,
  children,
  icon,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  icon?: IconName;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[13px] transition-all duration-200 ${
        active
          ? "border-[color-mix(in_srgb,var(--acc)_60%,transparent)] bg-[color-mix(in_srgb,var(--acc)_14%,transparent)] tx1"
          : "line-c tx3 hover:tx2 hover:border-[var(--line-2)]"
      }`}
    >
      {icon && <Icon name={icon} className="w-3.5 h-3.5" />}
      {children}
    </button>
  );
}

export function Seg<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex p-1 rounded-lg border line-c bg-[var(--bg-2)] gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
            value === o.value
              ? "bg-[color-mix(in_srgb,var(--acc)_18%,transparent)] tx1 border border-[color-mix(in_srgb,var(--acc)_45%,transparent)]"
              : "tx3 hover:tx2 border border-transparent"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Layout bits ---------------- */

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
        <p className="eyebrow mb-2.5">{eyebrow}</p>
        <InkTitle>
          <span className="font-display text-4xl sm:text-5xl font-semibold tx1 leading-[1.05]">{title}</span>
        </InkTitle>
        {sub && <p className="mt-3 tx3 max-w-xl leading-relaxed">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block mb-4">
      <span className="block font-mono text-[10px] tracking-[0.22em] uppercase tx3 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden>
      <span className="ornament-line flex-1" />
      <Icon name="spark" className="w-3.5 h-3.5 opacity-60 text-[var(--gold)]" />
      <span className="ornament-line flex-1" />
    </div>
  );
}

export function Empty({ icon = "spark", text }: { icon?: IconName; text: string }) {
  return (
    <div className="panel-in flex flex-col items-center justify-center py-14 gap-3">
      <Icon name={icon} className="w-7 h-7 tx3" />
      <p className="tx3 text-sm">{text}</p>
    </div>
  );
}
