import { useMemo, useState } from "react";
import { useLibrary } from "../../lib/store";
import type { LoreCategory, LoreEntry } from "../../lib/types";
import { LORE_CATEGORIES } from "../../lib/types";
import { Icon } from "../Icons";
import type { IconName } from "../Icons";
import { Btn, ConfirmBtn, Field, Modal, Ornament, Reveal, SectionHead } from "../ui";

const CAT_ICON: Record<LoreCategory, IconName> = {
  history: "hourglass",
  magic: "spark",
  peoples: "helm",
  places: "pin",
  factions: "banner",
  artifacts: "gem",
};

interface Draft {
  title: string;
  category: LoreCategory;
  content: string;
}
const emptyDraft: Draft = { title: "", category: "history", content: "" };

export function LoreTab() {
  const lib = useLibrary();
  const [cat, setCat] = useState<LoreCategory | "all">("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [modal, setModal] = useState<null | { mode: "new" } | { mode: "edit"; e: LoreEntry }>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const list = useMemo(
    () => (cat === "all" ? lib.lore : lib.lore.filter((e) => e.category === cat)),
    [lib.lore, cat],
  );

  const active = lib.lore.find((e) => e.id === activeId) ?? list[0] ?? null;
  const activeCat = active ? LORE_CATEGORIES.find((c) => c.id === active.category) : null;

  const openNew = () => {
    setDraft({ ...emptyDraft, category: cat === "all" ? "history" : cat });
    setModal({ mode: "new" });
  };
  const openEdit = (e: LoreEntry) => {
    setDraft({ title: e.title, category: e.category, content: e.content });
    setModal({ mode: "edit", e });
  };
  const save = () => {
    if (!draft.title.trim() || !draft.content.trim()) return;
    if (modal?.mode === "edit") {
      lib.updateLore(modal.e.id, { ...draft });
      setActiveId(modal.e.id);
    } else {
      lib.addLore({ ...draft });
    }
    setModal(null);
  };

  return (
    <div className="tab-in">
      <SectionHead
        eyebrow="Кодекс Аэлории"
        title="Лор мира"
        sub="Всё, что происходит за строками: эпохи, магия, народы и места. Собирайте мир по крупицам — книга скажет спасибо."
        action={
          <Btn variant="gold" onClick={openNew}>
            <Icon name="plus" className="w-4 h-4" /> Статья
          </Btn>
        }
      />

      <div className="grid lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* rail */}
        <Reveal className="lg:sticky lg:top-24">
          <div className="panel overflow-hidden">
            <div className="px-4 py-3 border-b border-line/70 font-mono text-[10px] tracking-[0.25em] uppercase text-parch-400">
              Рубрики кодекса
            </div>
            <button
              onClick={() => setCat("all")}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                cat === "all" ? "bg-gold-500/10 text-gold-200" : "text-parch-300 hover:bg-ink-700/50"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon name="book" className="w-4 h-4" /> Всё подряд
              </span>
              <span className="font-mono text-[11px] text-parch-400">{lib.lore.length}</span>
            </button>
            {LORE_CATEGORIES.map((c) => {
              const n = lib.lore.filter((e) => e.category === c.id).length;
              const isCat = cat === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors border-t border-line/40 ${
                    isCat ? "bg-gold-500/10 text-gold-200" : "text-parch-300 hover:bg-ink-700/50"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon name={CAT_ICON[c.id]} className={`w-4 h-4 ${isCat ? "text-gold-400" : "text-parch-400"}`} />
                    {c.label}
                  </span>
                  <span className="font-mono text-[11px] text-parch-400">{n}</span>
                </button>
              );
            })}

            <div className="px-4 py-3 border-t border-line/70 font-mono text-[10px] tracking-[0.25em] uppercase text-parch-400">
              Записи
            </div>
            {list.length === 0 && (
              <p className="px-4 py-4 text-sm text-parch-400 italic">В этой рубрике пока пусто.</p>
            )}
            {list.map((e) => (
              <button
                key={e.id}
                onClick={() => setActiveId(e.id)}
                className={`w-full text-left px-4 py-3 border-t border-line/40 transition-colors group ${
                  active?.id === e.id ? "bg-fog-500/10" : "hover:bg-ink-700/50"
                }`}
              >
                <div className={`font-display text-lg leading-snug ${active?.id === e.id ? "text-parch-100" : "text-parch-300"}`}>
                  {e.title}
                </div>
                <div className="font-mono text-[10px] tracking-wider uppercase text-parch-400/80 mt-1">
                  {LORE_CATEGORIES.find((c) => c.id === e.category)?.label}
                </div>
              </button>
            ))}
          </div>
        </Reveal>

        {/* reader */}
        {active ? (
          <Reveal delay={120} key={active.id}>
            <article className="panel panel-corner px-7 sm:px-12 py-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold-500/40 bg-gold-500/10 font-mono text-[10px] tracking-[0.22em] uppercase text-gold-300 mb-4">
                    <Icon name={CAT_ICON[active.category]} className="w-3.5 h-3.5" />
                    {activeCat?.label}
                  </span>
                  <h3 className="font-display text-4xl font-semibold text-parch-100 leading-tight">{active.title}</h3>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => openEdit(active)}
                    className="p-2 text-parch-400 hover:text-gold-300 transition-colors"
                    title="Редактировать"
                  >
                    <Icon name="edit" className="w-4.5 h-4.5" />
                  </button>
                  <ConfirmBtn
                    onConfirm={() => {
                      lib.deleteLore(active.id);
                      setActiveId(null);
                    }}
                    label={<span className="sr-only">Удалить</span>}
                  />
                </div>
              </div>

              <Ornament className="my-7" />

              <div className="prose-fantasy">
                {active.content.split(/\n+/).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </article>
          </Reveal>
        ) : (
          <div className="panel panel-corner p-12 text-center">
            <Icon name="scroll" className="w-10 h-10 text-gold-500/60 mx-auto mb-4" />
            <p className="font-display text-2xl text-parch-200 mb-2">Кодекс пуст</p>
            <p className="text-parch-400 mb-6">Запишите первое знание о своём мире.</p>
            <Btn variant="gold" onClick={openNew}>
              <Icon name="plus" className="w-4 h-4" /> Статья кодекса
            </Btn>
          </div>
        )}
      </div>

      {/* modal */}
      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.mode === "edit" ? "Правка статьи" : "Новая статья кодекса"}
        wide
      >
        <div className="grid sm:grid-cols-2 gap-x-5">
          <Field label="Название">
            <input
              className="field"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Эпоха Пепла"
              autoFocus
            />
          </Field>
          <Field label="Рубрика">
            <div className="flex flex-wrap gap-1.5 pt-1">
              {LORE_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setDraft({ ...draft, category: c.id })}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs transition-all ${
                    draft.category === c.id
                      ? "border-gold-500/60 bg-gold-500/15 text-gold-200"
                      : "border-line text-parch-400 hover:border-fog-500/50"
                  }`}
                >
                  <Icon name={CAT_ICON[c.id]} className="w-3.5 h-3.5" />
                  {c.label.split(" ")[0]}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <Field label="Текст · пустая строка разделяет абзацы">
          <textarea
            className="field min-h-[220px]"
            value={draft.content}
            onChange={(e) => setDraft({ ...draft, content: e.target.value })}
            placeholder="Триста лет назад небо над Аэлорией потемнело…"
          />
        </Field>

        <div className="flex justify-end gap-3 mt-2">
          <Btn onClick={() => setModal(null)}>Отмена</Btn>
          <Btn variant="gold" onClick={save} disabled={!draft.title.trim() || !draft.content.trim()}>
            <Icon name="check" className="w-4 h-4" /> Вписать в кодекс
          </Btn>
        </div>
      </Modal>
    </div>
  );
}
