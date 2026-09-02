import { useMemo, useState } from "react";
import type { Character, CharacterStatus } from "../types";
import { CHAR_COLORS, SIGILS } from "../types";
import { useLibrary } from "../hooks/useLibrary";
import { Icon } from "../components/Icons";
import type { IconName } from "../components/Icons";
import { Btn, Chip, ConfirmBtn, Empty, Field, Modal, Reveal, SectionHead, Tilt } from "../components/ui";

const STATUS_LABEL: Record<CharacterStatus, string> = {
  alive: "жив(а)",
  dead: "погиб(ла)",
  unknown: "судьба неизвестна",
};
const STATUS_COLOR: Record<CharacterStatus, string> = {
  alive: "var(--moss)",
  dead: "var(--danger)",
  unknown: "var(--frost)",
};

function Portrait({ c, size = "md" }: { c: Character; size?: "md" | "lg" }) {
  const [err, setErr] = useState(false);
  const cls = size === "lg" ? "h-[380px]" : "h-56";
  if (c.portrait && !err) {
    return (
      <div className={`${cls} overflow-hidden rounded-t-[9px] relative`}>
        <img
          src={c.portrait}
          alt={`Портрет: ${c.name}`}
          onError={() => setErr(true)}
          className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-[1.04]"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--panel)_85%,transparent)] via-transparent to-transparent" />
      </div>
    );
  }
  return (
    <div
      className={`${cls} flex items-center justify-center rounded-t-[9px] relative`}
      style={{
        background: `radial-gradient(80% 70% at 50% 30%, color-mix(in srgb, ${c.color} 22%, transparent), transparent), var(--bg-2)`,
      }}
    >
      <Icon name={(c.sigil as IconName) ?? "star"} className="w-14 h-14" strokeWidth={1.1} />
      <span className="absolute" style={{ color: c.color, opacity: 0.85 }}>
        <Icon name={(c.sigil as IconName) ?? "star"} className="w-14 h-14" strokeWidth={1.1} />
      </span>
    </div>
  );
}

interface Draft {
  name: string;
  role: string;
  race: string;
  age: string;
  height: string;
  faction: string;
  status: CharacterStatus;
  color: string;
  sigil: string;
  portrait: string;
  summary: string;
  bio: string;
  traits: string;
  goals: string;
  relationships: string;
  notes: string;
}

const emptyDraft: Draft = {
  name: "",
  role: "",
  race: "",
  age: "",
  height: "",
  faction: "",
  status: "alive",
  color: CHAR_COLORS[0],
  sigil: "star",
  portrait: "",
  summary: "",
  bio: "",
  traits: "",
  goals: "",
  relationships: "",
  notes: "",
};

export function CharactersPage() {
  const lib = useLibrary();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CharacterStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modal, setModal] = useState<null | { mode: "new" } | { mode: "edit"; ch: Character }>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const filtered = useMemo(
    () =>
      lib.characters.filter((c) => {
        const q = query.trim().toLowerCase();
        const okQ =
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q) ||
          c.faction.toLowerCase().includes(q);
        const okS = statusFilter === "all" || c.status === statusFilter;
        return okQ && okS;
      }),
    [lib.characters, query, statusFilter],
  );

  const selected = selectedId ? lib.characters.find((c) => c.id === selectedId) ?? null : null;

  const openNew = () => {
    setDraft(emptyDraft);
    setModal({ mode: "new" });
  };
  const openEdit = (ch: Character) => {
    setDraft({
      name: ch.name,
      role: ch.role,
      race: ch.race,
      age: ch.age,
      height: ch.height,
      faction: ch.faction,
      status: ch.status,
      color: ch.color,
      sigil: ch.sigil,
      portrait: ch.portrait ?? "",
      summary: ch.summary,
      bio: ch.bio,
      traits: ch.traits.join(", "),
      goals: ch.goals,
      relationships: ch.relationships,
      notes: ch.notes,
    });
    setModal({ mode: "edit", ch });
  };

  const save = () => {
    if (!draft.name.trim() || !modal) return;
    const data = {
      name: draft.name.trim(),
      role: draft.role.trim(),
      race: draft.race.trim(),
      age: draft.age.trim(),
      height: draft.height.trim(),
      faction: draft.faction.trim(),
      status: draft.status,
      color: draft.color,
      sigil: draft.sigil,
      portrait: draft.portrait.trim() || undefined,
      summary: draft.summary.trim(),
      bio: draft.bio.trim(),
      traits: draft.traits.split(",").map((s) => s.trim()).filter(Boolean),
      goals: draft.goals.trim(),
      relationships: draft.relationships.trim(),
      notes: draft.notes.trim(),
    };
    if (modal.mode === "new") lib.addCharacter(data);
    else lib.updateCharacter(modal.ch.id, data);
    setModal(null);
  };

  /* ===== досье ===== */
  if (selected) {
    return (
      <div className="tab-in">
        <button
          onClick={() => setSelectedId(null)}
          className="inline-flex items-center gap-1.5 tx2 hover:acc-t transition-colors text-sm mb-6"
        >
          <Icon name="chevronL" className="w-4 h-4" /> Все персонажи
        </button>

        <div className="grid lg:grid-cols-[340px_1fr] gap-8 items-start">
          <Reveal>
            <div className="panel-c overflow-hidden">
              <Portrait c={selected} size="lg" />
              <div className="p-6 -mt-10 relative">
                <h1 className="font-display text-3xl font-semibold tx1 leading-tight">{selected.name}</h1>
                <p className="tx2 mt-1">{selected.role}</p>
                <p
                  className="inline-flex items-center gap-1.5 mt-3 text-[12px] font-mono uppercase tracking-wider"
                  style={{ color: STATUS_COLOR[selected.status] }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLOR[selected.status] }} />
                  {STATUS_LABEL[selected.status]}
                </p>
                <div className="mt-5 space-y-2.5 text-sm border-t line-c pt-4">
                  <StatRow k="Раса" v={selected.race} />
                  <StatRow k="Возраст" v={selected.age} />
                  <StatRow k="Рост" v={selected.height} />
                  <StatRow k="Фракция" v={selected.faction} />
                </div>
                <div className="flex gap-2.5 mt-6">
                  <Btn onClick={() => openEdit(selected)} className="flex-1 justify-center">
                    <Icon name="edit" className="w-4 h-4" /> Править
                  </Btn>
                  <ConfirmBtn
                    onConfirm={() => {
                      lib.deleteCharacter(selected.id);
                      setSelectedId(null);
                    }}
                    label={<span className="text-sm px-2">Удалить</span>}
                    className="border line-c rounded-md px-2.5"
                  />
                </div>
              </div>
            </div>
          </Reveal>

          <div className="space-y-6">
            <Reveal delay={80}>
              <blockquote className="font-display italic text-xl tx2 leading-relaxed border-l-2 pl-5" style={{ borderColor: selected.color }}>
                {selected.summary}
              </blockquote>
            </Reveal>
            <Reveal delay={140}>
              <Section title="Биография">
                <div className="prose-fantasy !text-[1.02rem] !leading-[1.8]">
                  {selected.bio.split(/\n{2,}/).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </Section>
            </Reveal>
            {selected.traits.length > 0 && (
              <Reveal delay={200}>
                <Section title="Характер">
                  <div className="flex flex-wrap gap-2">
                    {selected.traits.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1.5 rounded-full border text-[13px] tx2"
                        style={{ borderColor: `color-mix(in srgb, ${selected.color} 40%, transparent)` }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </Section>
              </Reveal>
            )}
            <Reveal delay={260}>
              <div className="grid sm:grid-cols-2 gap-6">
                <Section title="Цели">
                  <p className="tx2 leading-relaxed text-[15px]">{selected.goals || "—"}</p>
                </Section>
                <Section title="Отношения">
                  <p className="tx2 leading-relaxed text-[15px]">{selected.relationships || "—"}</p>
                </Section>
              </div>
            </Reveal>
            {selected.notes && (
              <Reveal delay={320}>
                <div className="panel-in p-5">
                  <p className="font-mono text-[10px] tracking-[0.22em] uppercase acc-t mb-2">заметки автора</p>
                  <p className="font-mono text-[13px] leading-relaxed tx2 whitespace-pre-wrap">{selected.notes}</p>
                </div>
              </Reveal>
            )}
          </div>
        </div>

        <CharacterModal modal={modal} draft={draft} setDraft={setDraft} onClose={() => setModal(null)} onSave={save} />
      </div>
    );
  }

  /* ===== список ===== */
  return (
    <div className="tab-in">
      <SectionHead
        eyebrow="Действующие лица"
        title="Персонажи"
        sub="Картотека героев и теней рукописи. Карточка открывается кликом — там полное досье и заметки автора."
        action={
          <Btn variant="accent" onClick={openNew}>
            <Icon name="plus" className="w-4 h-4" /> Добавить персонажа
          </Btn>
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 tx3" />
          <input
            className="field pl-9"
            placeholder="Имя, роль, фракция…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>Все</Chip>
          {(Object.keys(STATUS_LABEL) as CharacterStatus[]).map((s) => (
            <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
              {STATUS_LABEL[s]}
            </Chip>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty icon="users" text="Никого не нашлось. Попробуйте другой запрос или добавьте персонажа." />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((c, i) => (
            <Reveal key={c.id} delay={(i % 3) * 80}>
              <Tilt max={5}>
                <button
                  onClick={() => setSelectedId(c.id)}
                  className="panel-c overflow-hidden text-left w-full group transition-shadow duration-300 hover:shadow-[0_18px_50px_-18px_rgba(0,0,0,0.65)] h-full"
                >
                  <Portrait c={c} />
                  <div className="p-5 -mt-9 relative">
                    <h3 className="font-display text-[22px] font-semibold tx1 leading-tight group-hover:acc-t transition-colors">
                      {c.name}
                    </h3>
                    <p className="tx3 text-sm mt-0.5">{c.role}</p>
                    <p
                      className="inline-flex items-center gap-1.5 mt-2.5 text-[11px] font-mono uppercase tracking-wider"
                      style={{ color: STATUS_COLOR[c.status] }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLOR[c.status] }} />
                      {STATUS_LABEL[c.status]}
                    </p>
                    {c.traits.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {c.traits.slice(0, 3).map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded border line-c tx3 text-[12px]">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              </Tilt>
            </Reveal>
          ))}
        </div>
      )}

      <CharacterModal modal={modal} draft={draft} setDraft={setDraft} onClose={() => setModal(null)} onSave={save} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="panel-c p-6">
      <p className="eyebrow mb-3">{title}</p>
      {children}
    </div>
  );
}

function StatRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="tx3">{k}</span>
      <span className="tx2 font-medium text-right">{v || "—"}</span>
    </div>
  );
}

function CharacterModal({
  modal,
  draft,
  setDraft,
  onClose,
  onSave,
}: {
  modal: { mode: "new" } | { mode: "edit"; ch: Character } | null;
  draft: Draft;
  setDraft: (d: Draft) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <Modal
      open={modal !== null}
      onClose={onClose}
      title={modal?.mode === "edit" ? "Правка персонажа" : "Новый персонаж"}
      wide
    >
      <div className="grid sm:grid-cols-2 gap-x-4">
        <Field label="Имя">
          <input className="field" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Эйлит из Веррена" autoFocus />
        </Field>
        <Field label="Роль в истории">
          <input className="field" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} placeholder="Наследница угасших маяков" />
        </Field>
        <Field label="Раса">
          <input className="field" value={draft.race} onChange={(e) => setDraft({ ...draft, race: e.target.value })} placeholder="Человек" />
        </Field>
        <Field label="Фракция">
          <input className="field" value={draft.faction} onChange={(e) => setDraft({ ...draft, faction: e.target.value })} placeholder="Орден Свитка" />
        </Field>
        <Field label="Возраст">
          <input className="field" value={draft.age} onChange={(e) => setDraft({ ...draft, age: e.target.value })} placeholder="19 лет" />
        </Field>
        <Field label="Рост">
          <input className="field" value={draft.height} onChange={(e) => setDraft({ ...draft, height: e.target.value })} placeholder="168 см" />
        </Field>
        <Field label="Статус">
          <select className="field" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as CharacterStatus })}>
            {(Object.keys(STATUS_LABEL) as CharacterStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
        </Field>
        <Field label="URL портрета (необязательно)">
          <input className="field" value={draft.portrait} onChange={(e) => setDraft({ ...draft, portrait: e.target.value })} placeholder="/images/portrait.jpg" />
        </Field>
      </div>
      <Field label="Цвет и герб карточки">
        <div className="flex flex-wrap items-center gap-2">
          {CHAR_COLORS.map((col) => (
            <button
              key={col}
              onClick={() => setDraft({ ...draft, color: col })}
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${draft.color === col ? "border-[var(--tx)]" : "border-transparent"}`}
              style={{ background: col }}
              aria-label={`Цвет ${col}`}
            />
          ))}
          <span className="mx-2 h-6 w-px bg-[var(--line)]" />
          {SIGILS.map((s) => (
            <button
              key={s}
              onClick={() => setDraft({ ...draft, sigil: s })}
              className={`p-2 rounded-md border transition-colors ${draft.sigil === s ? "border-[color-mix(in_srgb,var(--acc)_60%,transparent)] acc-t" : "line-c tx3"}`}
              aria-label={`Герб ${s}`}
            >
              <Icon name={s} className="w-4.5 h-4.5" />
            </button>
          ))}
        </div>
      </Field>
      <Field label="Краткое описание">
        <textarea className="field min-h-[64px]" value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} />
      </Field>
      <Field label="Расширенное описание (биография)">
        <textarea className="field min-h-[110px]" value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} />
      </Field>
      <Field label="Черты характера (через запятую)">
        <input className="field" value={draft.traits} onChange={(e) => setDraft({ ...draft, traits: e.target.value })} placeholder="упрямая, честная, боится огня" />
      </Field>
      <div className="grid sm:grid-cols-2 gap-x-4">
        <Field label="Цели">
          <textarea className="field min-h-[72px]" value={draft.goals} onChange={(e) => setDraft({ ...draft, goals: e.target.value })} />
        </Field>
        <Field label="Отношения">
          <textarea className="field min-h-[72px]" value={draft.relationships} onChange={(e) => setDraft({ ...draft, relationships: e.target.value })} />
        </Field>
      </div>
      <Field label="Заметки автора">
        <textarea className="field min-h-[72px]" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} placeholder="Речь, привычки, что не попало в текст…" />
      </Field>
      <div className="flex justify-end gap-3 mt-2">
        <Btn onClick={onClose}>Отмена</Btn>
        <Btn variant="accent" onClick={onSave} disabled={!draft.name.trim()}>
          <Icon name="check" className="w-4 h-4" /> Сохранить
        </Btn>
      </div>
    </Modal>
  );
}
