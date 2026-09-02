import { useMemo, useState } from "react";
import { useLibrary, wordCount, toRoman } from "../../lib/store";
import type { Chapter, TabId } from "../../lib/types";
import { Icon } from "../Icons";
import { Book3D } from "../Book3D";
import { Btn, ConfirmBtn, Field, Modal, Ornament, Reveal, SectionHead } from "../ui";

function InlineEdit({
  value,
  onSave,
  className,
  mono = false,
}: {
  value: string;
  onSave: (v: string) => void;
  className?: string;
  mono?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft.trim()) onSave(draft.trim());
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={`field w-auto ${className}`}
      />
    );
  }
  return (
    <button
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className={`group inline-flex items-center gap-3 text-left ${className}`}
      title="Нажмите, чтобы изменить"
    >
      <span className={mono ? "font-mono" : ""}>{value}</span>
      <Icon
        name="edit"
        className="w-4 h-4 shrink-0 text-gold-500/0 group-hover:text-gold-400 transition-colors"
      />
    </button>
  );
}

const emptyDraft = { title: "", epigraph: "", content: "" };

export function ChronicleTab({ onNavigate }: { onNavigate: (t: TabId) => void }) {
  const lib = useLibrary();
  const { chapters, meta, characters, locations, party } = lib;

  const [activeId, setActiveId] = useState<string | null>(chapters[chapters.length - 1]?.id ?? null);
  const active = chapters.find((c) => c.id === activeId) ?? chapters[chapters.length - 1] ?? null;

  const [modal, setModal] = useState<null | { mode: "new" } | { mode: "edit"; ch: Chapter }>(null);
  const [draft, setDraft] = useState(emptyDraft);

  const totalWords = useMemo(
    () => chapters.reduce((s, c) => s + wordCount(c.content), 0),
    [chapters],
  );

  const partyLoc = locations.find((l) => l.id === party.locationId);
  const activeIdx = active ? chapters.findIndex((c) => c.id === active.id) : -1;

  const openNew = () => {
    setDraft(emptyDraft);
    setModal({ mode: "new" });
  };
  const openEdit = (ch: Chapter) => {
    setDraft({ title: ch.title, epigraph: ch.epigraph, content: ch.content });
    setModal({ mode: "edit", ch });
  };
  const save = () => {
    if (!draft.title.trim() || !draft.content.trim()) return;
    if (modal?.mode === "edit") {
      lib.updateChapter(modal.ch.id, { ...draft });
      setActiveId(modal.ch.id);
    } else {
      const ch = lib.addChapter({ ...draft });
      setActiveId(ch.id);
    }
    setModal(null);
  };

  return (
    <div className="tab-in">
      {/* ===== author's desk ===== */}
      <section className="grid lg:grid-cols-[minmax(340px,430px)_1fr] gap-8 lg:gap-14 items-center mb-20">
        <Reveal>
          <Book3D />
        </Reveal>

        <div>
          <Reveal delay={80}>
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-gold-400/90 mb-3">
              ✦ Авторский стол · книга в работе
            </p>
            <div className="font-display text-5xl sm:text-6xl xl:text-7xl font-semibold text-parch-100 leading-[1.02] mb-2">
              <InlineEdit value={meta.title} onSave={(v) => lib.setMeta({ ...meta, title: v })} />
            </div>
            <p className="text-parch-400 text-lg mb-8">
              <InlineEdit
                value={meta.author === "имя автора" ? "нажмите — укажите автора" : meta.author}
                onSave={(v) => lib.setMeta({ ...meta, author: v })}
              />
            </p>
          </Reveal>

          <Reveal delay={160}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line/60 border border-line rounded-lg overflow-hidden mb-6">
              {[
                { n: chapters.length, l: "глав" },
                { n: totalWords.toLocaleString("ru-RU"), l: "слов" },
                { n: characters.length, l: "персонажей" },
                { n: locations.length, l: "локаций" },
              ].map((s, i) => (
                <div key={i} className="bg-ink-900/90 px-4 py-4 hover:bg-ink-800 transition-colors">
                  <div className="font-display text-3xl font-semibold text-gold-300">{s.n}</div>
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-parch-400 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={240}>
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <button
                onClick={() => onNavigate("map")}
                className="group inline-flex items-center gap-2.5 px-4 py-2.5 rounded-md border border-fog-500/40 bg-fog-500/10 hover:bg-fog-500/20 transition-all duration-200"
              >
                <Icon name="pin" className="w-4 h-4 text-fog-300" />
                <span className="text-sm text-fog-300 font-semibold">
                  Герои сейчас: {partyLoc ? partyLoc.name : "в пути"}
                </span>
                <Icon name="arrow" className="w-4 h-4 text-fog-400 group-hover:translate-x-1 transition-transform" />
              </button>
              <Btn variant="gold" onClick={openNew}>
                <Icon name="quill" className="w-4 h-4" /> Новая глава
              </Btn>
              <Btn onClick={() => onNavigate("characters")}>
                <Icon name="helm" className="w-4 h-4" /> Персонажи
              </Btn>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <blockquote className="border-l-2 border-gold-500/50 pl-5 font-read italic text-parch-300 text-lg leading-relaxed max-w-xl">
              «Все дороги Аэлории ведут к морю. Вопрос лишь в том, что море вернёт взамен».
              <footer className="font-mono not-italic text-[11px] tracking-[0.2em] uppercase text-parch-400 mt-2">
                — из черновика, глава I
              </footer>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* ===== chapters ===== */}
      <section>
        <SectionHead
          eyebrow="Рукопись"
          title="Главы"
          sub="Черновик хранится прямо здесь — в браузере. Пишите, правьте, возвращайтесь: всё останется на месте."
          action={
            <Btn variant="gold" onClick={openNew}>
              <Icon name="plus" className="w-4 h-4" /> Глава
            </Btn>
          }
        />

        {chapters.length === 0 ? (
          <div className="panel panel-corner p-12 text-center">
            <Icon name="quill" className="w-10 h-10 text-gold-500/60 mx-auto mb-4" />
            <p className="font-display text-2xl text-parch-200 mb-2">Чистый пергамент</p>
            <p className="text-parch-400 mb-6">Начните рукопись с первой главы.</p>
            <Btn variant="gold" onClick={openNew}>
              <Icon name="quill" className="w-4 h-4" /> Написать главу I
            </Btn>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[330px_1fr] gap-6 items-start">
            {/* list */}
            <Reveal className="lg:sticky lg:top-24">
              <div className="panel overflow-hidden">
                {chapters.map((ch, i) => {
                  const isActive = active?.id === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setActiveId(ch.id)}
                      className={`w-full text-left px-5 py-4 border-b border-line/60 last:border-b-0 transition-all duration-200 group ${
                        isActive ? "bg-gold-500/10" : "hover:bg-ink-700/50"
                      }`}
                    >
                      <div className="flex items-baseline gap-3">
                        <span
                          className={`font-display text-xl font-semibold shrink-0 w-9 ${
                            isActive ? "text-gold-300" : "text-parch-400 group-hover:text-parch-200"
                          }`}
                        >
                          {toRoman(i + 1)}
                        </span>
                        <span
                          className={`font-display text-lg leading-snug ${
                            isActive ? "text-parch-100" : "text-parch-300"
                          }`}
                        >
                          {ch.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 pl-12 font-mono text-[10px] tracking-wider text-parch-400/80">
                        <span>{wordCount(ch.content)} слов</span>
                        <span>·</span>
                        <span>
                          {new Date(ch.updatedAt).toLocaleDateString("ru-RU", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Reveal>

            {/* reader */}
            {active && (
              <Reveal delay={120}>
                <article className="panel panel-corner px-7 sm:px-12 py-10">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-gold-400/90 mb-2">
                        Глава {toRoman(activeIdx + 1)}
                      </p>
                      <h3 className="font-display text-3xl sm:text-4xl font-semibold text-parch-100 leading-tight">
                        {active.title}
                      </h3>
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
                          lib.deleteChapter(active.id);
                          setActiveId(null);
                        }}
                        label={<span className="sr-only">Удалить</span>}
                      />
                    </div>
                  </div>

                  {active.epigraph && (
                    <p className="font-read italic text-parch-300/90 border-l-2 border-fog-500/50 pl-4 mb-7 text-[1.02rem]">
                      {active.epigraph}
                    </p>
                  )}

                  <div className="prose-fantasy">
                    {active.content.split(/\n+/).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>

                  <Ornament className="my-9" />

                  <div className="flex items-center justify-between">
                    <Btn
                      disabled={activeIdx <= 0}
                      onClick={() => setActiveId(chapters[activeIdx - 1]?.id)}
                    >
                      <Icon name="arrow" className="w-4 h-4 rotate-180" /> Назад
                    </Btn>
                    <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-parch-400">
                      {wordCount(active.content)} слов · правлено{" "}
                      {new Date(active.updatedAt).toLocaleDateString("ru-RU")}
                    </span>
                    <Btn
                      disabled={activeIdx >= chapters.length - 1}
                      onClick={() => setActiveId(chapters[activeIdx + 1]?.id)}
                    >
                      Дальше <Icon name="arrow" className="w-4 h-4" />
                    </Btn>
                  </div>
                </article>
              </Reveal>
            )}
          </div>
        )}
      </section>

      {/* ===== chapter modal ===== */}
      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.mode === "edit" ? "Правка главы" : "Новая глава"}
        wide
      >
        <Field label="Название главы">
          <input
            className="field"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="Дорога к Лунному порту"
            autoFocus
          />
        </Field>
        <Field label="Эпиграф (необязательно)">
          <input
            className="field"
            value={draft.epigraph}
            onChange={(e) => setDraft({ ...draft, epigraph: e.target.value })}
            placeholder="«Цитата, задающая тон»"
          />
        </Field>
        <Field label="Текст главы · пустая строка разделяет абзацы">
          <textarea
            className="field min-h-[280px]"
            value={draft.content}
            onChange={(e) => setDraft({ ...draft, content: e.target.value })}
            placeholder="Жил-был хранитель последнего маяка…"
          />
        </Field>
        <div className="flex justify-end gap-3 mt-2">
          <Btn onClick={() => setModal(null)}>Отмена</Btn>
          <Btn variant="gold" onClick={save} disabled={!draft.title.trim() || !draft.content.trim()}>
            <Icon name="check" className="w-4 h-4" /> Сохранить в рукопись
          </Btn>
        </div>
      </Modal>
    </div>
  );
}
