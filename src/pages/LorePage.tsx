import { useMemo, useState } from "react";
import type { LoreCategory, LoreEntry } from "../types";
import { LORE_CATEGORIES } from "../types";
import { useLibrary } from "../hooks/useLibrary";
import { Icon } from "../components/Icons";
import type { IconName } from "../components/Icons";
import { Btn, Chip, ConfirmBtn, Empty, Field, Modal, Reveal, SectionHead } from "../components/ui";

const CAT = (id: LoreCategory) => LORE_CATEGORIES.find((c) => c.id === id)!;

interface Draft {
  title: string;
  category: LoreCategory;
  content: string;
}
const emptyDraft: Draft = { title: "", category: "mir", content: "" };

export function LorePage() {
  const lib = useLibrary();
  const [cat, setCat] = useState<LoreCategory | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(lib.lore[0]?.id ?? null);
  const [modal, setModal] = useState<null | { mode: "new" } | { mode: "edit"; entry: LoreEntry }>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const filtered = useMemo(
    () => (cat === "all" ? lib.lore : lib.lore.filter((e) => e.category === cat)),
    [lib.lore, cat],
  );
  const selected = selectedId ? lib.lore.find((e) => e.id === selectedId) ?? null : null;

  const counts = useMemo(() => {
    const m = new Map<LoreCategory, number>();
    lib.lore.forEach((e) => m.set(e.category, (m.get(e.category) ?? 0) + 1));
    return m;
  }, [lib.lore]);

  const openNew = () => {
    setDraft(cat === "all" ? emptyDraft : { ...emptyDraft, category: cat });
    setModal({ mode: "new" });
  };
  const openEdit = (e: LoreEntry) => {
    setDraft({ title: e.title, category: e.category, content: e.content });
    setModal({ mode: "edit", entry: e });
  };
  const save = () => {
    if (!draft.title.trim() || !modal) return;
    const data = { title: draft.title.trim(), category: draft.category, content: draft.content.trim() };
    if (modal.mode === "new") lib.addLore(data);
    else lib.updateLore(modal.entry.id, data);
    setModal(null);
  };

  return (
    <div className="tab-in">
      <SectionHead
        eyebrow="Кодекс мира"
        title="Лор Аэлории"
        sub="Всё, что держит мир на плаву: эпохи, магия, фракции, культы, артефакты. Записи можно добавлять и править — они хранятся локально."
        action={
          <Btn variant="accent" onClick={openNew}>
            <Icon name="plus" className="w-4 h-4" /> Новая запись
          </Btn>
        }
      />

      <div className="flex flex-wrap gap-2 mb-8">
        <Chip active={cat === "all"} onClick={() => setCat("all")}>
          Все · {lib.lore.length}
        </Chip>
        {LORE_CATEGORIES.map((c) => (
          <Chip
            key={c.id}
            active={cat === c.id}
            onClick={() => setCat(c.id)}
            icon={c.icon as IconName}
          >
            {c.label}{counts.get(c.id) ? ` · ${counts.get(c.id)}` : ""}
          </Chip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty icon="scroll" text="В этой рубрике пока пусто. Добавьте первую запись." />
      ) : (
        <div className="grid lg:grid-cols-[360px_1fr] gap-6 items-start">
          <Reveal>
            <div className="panel-c overflow-hidden">
              <div className="max-h-[62vh] overflow-y-auto">
                {filtered.map((e) => {
                  const active = selectedId === e.id;
                  return (
                    <button
                      key={e.id}
                      onClick={() => setSelectedId(e.id)}
                      className={`w-full text-left px-5 py-4 border-b line-c last:border-b-0 transition-colors ${
                        active
                          ? "bg-[color-mix(in_srgb,var(--acc)_10%,transparent)]"
                          : "hover:bg-[color-mix(in_srgb,var(--panel-2)_60%,transparent)]"
                      }`}
                    >
                      <span className="flex items-center gap-2 mb-1">
                        <Icon
                          name={CAT(e.category).icon as IconName}
                          className={`w-3.5 h-3.5 ${active ? "acc-t" : "tx3"}`}
                        />
                        <span className={`font-mono text-[10px] tracking-[0.18em] uppercase ${active ? "acc-t" : "tx3"}`}>
                          {CAT(e.category).label}
                        </span>
                      </span>
                      <span className={`block font-display text-lg font-medium leading-tight ${active ? "tx1" : "tx2"}`}>
                        {e.title}
                      </span>
                      <span className="block tx3 text-[13px] mt-1 line-clamp-2 leading-snug">
                        {e.content.split(/\n{2,}/)[0].slice(0, 130)}…
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            {selected ? (
              <div className="panel-c panel-corner p-7 sm:p-10">
                <p className="eyebrow mb-3">{CAT(selected.category).label}</p>
                <h2 className="font-display text-4xl font-semibold tx1 leading-tight mb-6">{selected.title}</h2>
                <div className="prose-fantasy">
                  {selected.content.split(/\n{2,}/).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                <div className="flex gap-3 mt-10 pt-6 border-t line-c">
                  <Btn onClick={() => openEdit(selected)}>
                    <Icon name="edit" className="w-4 h-4" /> Править
                  </Btn>
                  <ConfirmBtn
                    onConfirm={() => {
                      lib.deleteLore(selected.id);
                      setSelectedId(null);
                    }}
                    label={<span className="text-sm px-2">Удалить</span>}
                    className="border line-c rounded-md px-2.5"
                  />
                </div>
              </div>
            ) : (
              <Empty icon="scroll" text="Выберите запись слева, чтобы прочитать." />
            )}
          </Reveal>
        </div>
      )}

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.mode === "edit" ? "Правка записи" : "Новая запись лора"}
        wide
      >
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LORE_CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setDraft({ ...draft, category: c.id })}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border text-[13px] transition-colors ${
                  draft.category === c.id
                    ? "border-[color-mix(in_srgb,var(--acc)_60%,transparent)] bg-[color-mix(in_srgb,var(--acc)_12%,transparent)] tx1"
                    : "line-c tx3 hover:tx2"
                }`}
              >
                <Icon name={c.icon as IconName} className="w-4 h-4" />
                {c.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Текст записи (пустая строка разделяет абзацы)">
          <textarea
            className="field min-h-[180px]"
            value={draft.content}
            onChange={(e) => setDraft({ ...draft, content: e.target.value })}
            placeholder="Триста лет назад небо над Аэлорией потемнело…"
          />
        </Field>
        <div className="flex justify-end gap-3 mt-2">
          <Btn onClick={() => setModal(null)}>Отмена</Btn>
          <Btn variant="accent" onClick={save} disabled={!draft.title.trim()}>
            <Icon name="check" className="w-4 h-4" /> Сохранить
          </Btn>
        </div>
      </Modal>
    </div>
  );
}
