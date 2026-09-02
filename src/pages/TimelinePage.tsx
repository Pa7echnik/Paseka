import { useMemo, useState } from "react";
import type { EventCategory, Tab, TimelineEvent } from "../types";
import { ERAS, EVENT_CATEGORIES } from "../types";
import { useLibrary } from "../hooks/useLibrary";
import { Icon } from "../components/Icons";
import { Btn, Chip, ConfirmBtn, Empty, Field, Modal, Reveal, SectionHead } from "../components/ui";

interface Draft {
  title: string;
  era: string;
  yearLabel: string;
  category: EventCategory;
  description: string;
  locationId: string;
  importance: 1 | 2 | 3;
}
const emptyDraft: Draft = {
  title: "",
  era: ERAS[3],
  yearLabel: "Год 379",
  category: "сюжет",
  description: "",
  locationId: "",
  importance: 2,
};

export function TimelinePage({ onNav }: { onNav: (tab: Tab) => void }) {
  const lib = useLibrary();
  const [era, setEra] = useState<string | "all">("all");
  const [cat, setCat] = useState<EventCategory | "all">("all");
  const [modal, setModal] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const filtered = useMemo(
    () =>
      lib.events.filter(
        (e) => (era === "all" || e.era === era) && (cat === "all" || e.category === cat),
      ),
    [lib.events, era, cat],
  );

  const save = () => {
    if (!draft.title.trim()) return;
    lib.addEvent({
      title: draft.title.trim(),
      era: draft.era,
      yearLabel: draft.yearLabel.trim() || "—",
      category: draft.category,
      description: draft.description.trim(),
      locationId: draft.locationId || null,
      importance: draft.importance,
    });
    setModal(false);
    setDraft(emptyDraft);
  };

  return (
    <div className="tab-in">
      <SectionHead
        eyebrow="Летопись"
        title="Хроника событий"
        sub="От Зажжения Двенадцати Маяков до сегодняшнего дня в Лунном порту. Точки с меткой места связаны с картой."
        action={
          <Btn variant="accent" onClick={() => setModal(true)}>
            <Icon name="plus" className="w-4 h-4" /> Добавить событие
          </Btn>
        }
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <Chip active={era === "all"} onClick={() => setEra("all")}>Все эпохи</Chip>
        {ERAS.map((e) => (
          <Chip key={e} active={era === e} onClick={() => setEra(e)}>{e}</Chip>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-10">
        <Chip active={cat === "all"} onClick={() => setCat("all")}>Все темы</Chip>
        {EVENT_CATEGORIES.map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty icon="clock" text="Под эти фильтры не попало ни одно событие." />
      ) : (
        <div className="relative max-w-3xl">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[var(--line)]" aria-hidden />
          <div className="space-y-10">
            {filtered.map((e, i) => (
              <TimelineNode
                key={e.id}
                e={e}
                delay={i * 60}
                locationName={e.locationId ? lib.locations.find((l) => l.id === e.locationId)?.name ?? null : null}
                onLoc={() => onNav("map")}
                onDelete={() => lib.deleteEvent(e.id)}
                isNow={lib.party.locationId !== null && e.locationId === lib.party.locationId}
              />
            ))}
          </div>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Новое событие" wide>
        <div className="grid sm:grid-cols-2 gap-x-4">
          <Field label="Название">
            <input className="field" value={draft.title} onChange={(ev) => setDraft({ ...draft, title: ev.target.value })} placeholder="Падение девятого маяка" autoFocus />
          </Field>
          <Field label="Год / датировка">
            <input className="field" value={draft.yearLabel} onChange={(ev) => setDraft({ ...draft, yearLabel: ev.target.value })} placeholder="Год 379, третья луна" />
          </Field>
          <Field label="Эпоха">
            <select className="field" value={draft.era} onChange={(ev) => setDraft({ ...draft, era: ev.target.value })}>
              {ERAS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </Field>
          <Field label="Тема">
            <select className="field" value={draft.category} onChange={(ev) => setDraft({ ...draft, category: ev.target.value as EventCategory })}>
              {EVENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Место (необязательно)">
            <select className="field" value={draft.locationId} onChange={(ev) => setDraft({ ...draft, locationId: ev.target.value })}>
              <option value="">— без привязки —</option>
              {lib.locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Важность">
            <select className="field" value={draft.importance} onChange={(ev) => setDraft({ ...draft, importance: Number(ev.target.value) as 1 | 2 | 3 })}>
              <option value={1}>фоновое</option>
              <option value={2}>заметное</option>
              <option value={3}>ключевое</option>
            </select>
          </Field>
        </div>
        <Field label="Описание">
          <textarea className="field min-h-[110px]" value={draft.description} onChange={(ev) => setDraft({ ...draft, description: ev.target.value })} />
        </Field>
        <div className="flex justify-end gap-3 mt-2">
          <Btn onClick={() => setModal(false)}>Отмена</Btn>
          <Btn variant="accent" onClick={save} disabled={!draft.title.trim()}>
            <Icon name="check" className="w-4 h-4" /> Вписать в летопись
          </Btn>
        </div>
      </Modal>
    </div>
  );
}

function TimelineNode({
  e,
  delay,
  locationName,
  onLoc,
  onDelete,
  isNow,
}: {
  e: TimelineEvent;
  delay: number;
  locationName: string | null;
  onLoc: () => void;
  onDelete: () => void;
  isNow: boolean;
}) {
  const size = e.importance === 3 ? 19 : e.importance === 2 ? 15 : 11;
  return (
    <Reveal delay={delay}>
      <div className="relative pl-10 group">
        <span
          className="absolute left-0 top-1.5 rounded-full border-2 bg-[var(--bg)] transition-transform group-hover:scale-110"
          style={{
            width: size,
            height: size,
            borderColor: "var(--acc)",
            boxShadow: e.importance === 3 ? "0 0 12px color-mix(in srgb, var(--acc) 55%, transparent)" : undefined,
          }}
          aria-hidden
        />
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1.5">
          <span className="font-mono text-[11px] tracking-[0.18em] uppercase acc-t">{e.yearLabel}</span>
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase tx3">{e.era}</span>
          <span className="px-2 py-0.5 rounded border line-c tx3 text-[11px]">{e.category}</span>
          {isNow && (
            <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider acc-t">
              <Icon name="star" className="w-3 h-3" /> происходит сейчас
            </span>
          )}
          <ConfirmBtn onConfirm={onDelete} label={<span className="sr-only">Удалить</span>} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <h3 className="font-display text-2xl font-semibold tx1 leading-tight">{e.title}</h3>
        <p className="tx2 leading-relaxed mt-2 max-w-2xl text-[15px]">{e.description}</p>
        {locationName && (
          <button
            onClick={onLoc}
            className="inline-flex items-center gap-1.5 mt-3 tx3 text-[13px] hover:acc-t transition-colors"
          >
            <Icon name="pin" className="w-3.5 h-3.5" /> {locationName} — показать на карте
          </button>
        )}
      </div>
    </Reveal>
  );
}
