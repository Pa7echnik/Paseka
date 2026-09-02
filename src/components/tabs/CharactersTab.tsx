import { useMemo, useState } from "react";
import { useLibrary } from "../../lib/store";
import type { CharStatus, Character, SigilShape } from "../../lib/types";
import { CHAR_COLORS, STATUS_LABELS } from "../../lib/types";
import { Icon } from "../Icons";
import type { IconName } from "../Icons";
import { Btn, ConfirmBtn, Field, Modal, Reveal, SectionHead, Tilt } from "../ui";

const SIGILS: { id: SigilShape; icon: IconName; label: string }[] = [
  { id: "star", icon: "star", label: "Звезда" },
  { id: "moon", icon: "moon", label: "Луна" },
  { id: "diamond", icon: "diamond", label: "Ромб" },
  { id: "sword", icon: "sword", label: "Клинок" },
  { id: "flame", icon: "flame", label: "Пламя" },
  { id: "eye", icon: "eye", label: "Око" },
];

const statusStyle: Record<CharStatus, string> = {
  alive: "text-fog-300 border-fog-500/45 bg-fog-500/10",
  dead: "text-blood border-blood/45 bg-blood/10",
  unknown: "text-mist border-mist/45 bg-mist/10",
};

function SigilBadge({ ch, size = "w-14 h-14" }: { ch: Character; size?: string }) {
  const s = SIGILS.find((x) => x.id === ch.sigil) ?? SIGILS[0];
  return (
    <div
      className={`${size} rounded-full border flex items-center justify-center shrink-0`}
      style={{
        borderColor: `${ch.color}66`,
        background: `radial-gradient(circle at 32% 28%, ${ch.color}2e, rgba(12,19,16,0.6) 70%)`,
        boxShadow: `0 0 18px ${ch.color}22, inset 0 0 12px ${ch.color}14`,
      }}
    >
      <Icon name={s.icon} className="w-6 h-6" strokeWidth={1.5} />
      <span className="sr-only">{s.label}</span>
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

interface Draft {
  name: string;
  role: string;
  status: CharStatus;
  color: string;
  sigil: SigilShape;
  traits: string;
  bio: string;
}

const emptyDraft: Draft = {
  name: "",
  role: "",
  status: "alive",
  color: CHAR_COLORS[0],
  sigil: "star",
  traits: "",
  bio: "",
};

export function CharactersTab() {
  const lib = useLibrary();
  const [filter, setFilter] = useState<CharStatus | "all">("all");
  const [modal, setModal] = useState<null | { mode: "new" } | { mode: "edit"; ch: Character }>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const list = useMemo(
    () => (filter === "all" ? lib.characters : lib.characters.filter((c) => c.status === filter)),
    [lib.characters, filter],
  );

  const openNew = () => {
    setDraft(emptyDraft);
    setModal({ mode: "new" });
  };
  const openEdit = (ch: Character) => {
    setDraft({
      name: ch.name,
      role: ch.role,
      status: ch.status,
      color: ch.color,
      sigil: ch.sigil,
      traits: ch.traits.join(", "),
      bio: ch.bio,
    });
    setModal({ mode: "edit", ch });
  };
  const save = () => {
    if (!draft.name.trim()) return;
    const payload = {
      name: draft.name.trim(),
      role: draft.role.trim() || "роль не указана",
      status: draft.status,
      color: draft.color,
      sigil: draft.sigil,
      traits: draft.traits.split(",").map((t) => t.trim()).filter(Boolean),
      bio: draft.bio.trim(),
    };
    if (modal?.mode === "edit") lib.updateCharacter(modal.ch.id, payload);
    else lib.addCharacter(payload);
    setModal(null);
  };

  return (
    <div className="tab-in">
      <SectionHead
        eyebrow="Драматис персоне"
        title="Персонажи"
        sub="Досье на всех, кто идёт по страницам вашей книги. Наведите курсор на карточку — она отзовётся."
        action={
          <Btn variant="gold" onClick={openNew}>
            <Icon name="plus" className="w-4 h-4" /> Персонаж
          </Btn>
        }
      />

      {/* status filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(["all", "alive", "dead", "unknown"] as const).map((s) => {
          const count =
            s === "all" ? lib.characters.length : lib.characters.filter((c) => c.status === s).length;
          const activeBtn = filter === s;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3.5 py-1.5 rounded-full border text-sm font-medium transition-all duration-200 ${
                activeBtn
                  ? "border-gold-500/60 bg-gold-500/15 text-gold-200"
                  : "border-line text-parch-400 hover:text-parch-200 hover:border-fog-500/50"
              }`}
            >
              {s === "all" ? "Все" : STATUS_LABELS[s]}
              <span className={`ml-2 font-mono text-[11px] ${activeBtn ? "text-gold-400" : "text-parch-400/70"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <div className="panel panel-corner p-12 text-center">
          <Icon name="helm" className="w-10 h-10 text-gold-500/60 mx-auto mb-4" />
          <p className="font-display text-2xl text-parch-200 mb-2">
            {filter === "all" ? "Пока никого" : "В этой судьбе — пусто"}
          </p>
          <p className="text-parch-400 mb-6">
            {filter === "all"
              ? "Добавьте первого героя — с гербом, чертами и историей."
              : "Смените фильтр или добавьте персонажа с этой судьбой."}
          </p>
          <Btn variant="gold" onClick={openNew}>
            <Icon name="plus" className="w-4 h-4" /> Добавить
          </Btn>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {list.map((ch, i) => (
            <Reveal key={ch.id} delay={(i % 3) * 90}>
              <Tilt max={7} className="h-full">
                <div className="panel relative h-full px-6 py-6 group hover:border-gold-500/35 transition-colors duration-300 overflow-hidden">
                  {/* tinted top glow */}
                  <div
                    className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl opacity-25 pointer-events-none transition-opacity group-hover:opacity-45"
                    style={{ background: ch.color }}
                  />

                  <div className="flex items-start gap-4 mb-4 relative">
                    <SigilBadge ch={ch} />
                    <div className="min-w-0">
                      <h3 className="font-display text-2xl font-semibold text-parch-100 leading-tight">
                        {ch.name}
                      </h3>
                      <p className="text-parch-400 text-sm mt-1 leading-snug">{ch.role}</p>
                      <span
                        className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full border text-[11px] font-mono tracking-wider uppercase ${statusStyle[ch.status]}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            ch.status === "alive" ? "bg-fog-300" : ch.status === "dead" ? "bg-blood" : "bg-mist"
                          }`}
                          style={ch.status === "alive" ? { animation: "glimmer 2.4s ease-in-out infinite" } : undefined}
                        />
                        {STATUS_LABELS[ch.status]}
                      </span>
                    </div>
                    <span
                      className="ml-auto font-display text-xl font-semibold opacity-25 select-none"
                      style={{ color: ch.color }}
                    >
                      {initials(ch.name)}
                    </span>
                  </div>

                  {ch.traits.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {ch.traits.map((t, j) => (
                        <span
                          key={j}
                          className="px-2 py-0.5 rounded border border-line bg-ink-900/60 text-parch-300 text-xs"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="font-read text-[0.98rem] leading-relaxed text-parch-200/90">{ch.bio || "История ещё не записана."}</p>

                  <div className="flex items-center justify-end gap-4 mt-5 pt-4 border-t border-line/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => openEdit(ch)}
                      className="inline-flex items-center gap-1.5 text-sm text-parch-400 hover:text-gold-300 transition-colors"
                    >
                      <Icon name="edit" className="w-4 h-4" /> Править
                    </button>
                    <ConfirmBtn onConfirm={() => lib.deleteCharacter(ch.id)} label={<span className="text-sm">Удалить</span>} />
                  </div>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      )}

      {/* ===== modal ===== */}
      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.mode === "edit" ? "Правка досье" : "Новый персонаж"}
        wide
      >
        <div className="grid sm:grid-cols-2 gap-x-5">
          <Field label="Имя">
            <input
              className="field"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Эйлит из Веррена"
              autoFocus
            />
          </Field>
          <Field label="Роль / амплуа">
            <input
              className="field"
              value={draft.role}
              onChange={(e) => setDraft({ ...draft, role: e.target.value })}
              placeholder="Протагонист · наследница маяков"
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-x-5">
          <Field label="Судьба">
            <div className="flex gap-2">
              {(["alive", "dead", "unknown"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setDraft({ ...draft, status: s })}
                  className={`flex-1 px-2 py-2 rounded-md border text-[12px] font-mono uppercase tracking-wider transition-all ${
                    draft.status === s
                      ? "border-gold-500/60 bg-gold-500/15 text-gold-200"
                      : "border-line text-parch-400 hover:border-fog-500/50"
                  }`}
                >
                  {STATUS_LABELS[s].split("(")[0]}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Цвет герба">
            <div className="flex gap-2 items-center h-[42px]">
              {CHAR_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setDraft({ ...draft, color: c })}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    draft.color === c ? "border-parch-100 scale-110" : "border-transparent"
                  }`}
                  style={{ background: c, boxShadow: `0 0 10px ${c}44` }}
                  aria-label={`Цвет ${c}`}
                />
              ))}
            </div>
          </Field>
        </div>

        <Field label="Герб">
          <div className="flex flex-wrap gap-2">
            {SIGILS.map((s) => (
              <button
                key={s.id}
                onClick={() => setDraft({ ...draft, sigil: s.id })}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-all ${
                  draft.sigil === s.id
                    ? "border-gold-500/60 bg-gold-500/15 text-gold-200"
                    : "border-line text-parch-400 hover:border-fog-500/50"
                }`}
              >
                <Icon name={s.icon} className="w-4 h-4" />
                <span className="text-sm">{s.label}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field label="Черты · через запятую">
          <input
            className="field"
            value={draft.traits}
            onChange={(e) => setDraft({ ...draft, traits: e.target.value })}
            placeholder="упрямая, видит сквозь туман, боится огня"
          />
        </Field>

        <Field label="История">
          <textarea
            className="field min-h-[140px]"
            value={draft.bio}
            onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
            placeholder="Откуда родом, чего хочет, чего боится…"
          />
        </Field>

        <div className="flex justify-end gap-3 mt-2">
          <Btn onClick={() => setModal(null)}>Отмена</Btn>
          <Btn variant="gold" onClick={save} disabled={!draft.name.trim()}>
            <Icon name="check" className="w-4 h-4" /> Внести в досье
          </Btn>
        </div>
      </Modal>
    </div>
  );
}
