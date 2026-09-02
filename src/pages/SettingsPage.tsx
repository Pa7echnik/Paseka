import type { ColumnWidth, FontScale, ThemeMode } from "../types";
import { useLibrary } from "../hooks/useLibrary";
import { useSettings } from "../hooks/useSettings";
import { Icon } from "../components/Icons";
import { Btn, ConfirmBtn, Reveal, SectionHead, Seg } from "../components/ui";

const WIDTH_CLASS: Record<ColumnWidth, string> = {
  narrow: "max-w-[420px]",
  normal: "max-w-[540px]",
  wide: "max-w-[680px]",
};

export function SettingsPage() {
  const { settings, update } = useSettings();
  const lib = useLibrary();

  return (
    <div className="tab-in">
      <SectionHead
        eyebrow="Скрипторий"
        title="Настройки"
        sub="Оформление, режим чтения, движение и звук. Всё сохраняется локально в браузере."
      />

      <div className="grid lg:grid-cols-2 gap-6 items-start max-w-5xl">
        {/* оформление */}
        <Reveal>
          <div className="panel-c p-7">
            <h3 className="font-display text-2xl font-semibold tx1 mb-6">Оформление</h3>
            <div className="space-y-6">
              <div>
                <p className="font-mono text-[10px] tracking-[0.22em] uppercase tx3 mb-2.5">Тема</p>
                <Seg<ThemeMode>
                  value={settings.theme}
                  onChange={(v) => update({ theme: v })}
                  options={[
                    { value: "ink", label: "Чернила" },
                    { value: "parchment", label: "Пергамент" },
                  ]}
                />
                <p className="tx3 text-[13px] mt-2.5">
                  «Чернила» — ночной скрипторий, «Пергамент» — светлая страница для долгого чтения.
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.22em] uppercase tx3 mb-2.5">Движение и анимации</p>
                <Seg<"on" | "off">
                  value={settings.motion ? "on" : "off"}
                  onChange={(v) => update({ motion: v === "on" })}
                  options={[
                    { value: "on", label: "Включено" },
                    { value: "off", label: "Выключено" },
                  ]}
                />
                <p className="tx3 text-[13px] mt-2.5">
                  Отключает частицы, параллакс и плавные переходы. По умолчанию уважает системную настройку
                  prefers-reduced-motion.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* чтение */}
        <Reveal delay={90}>
          <div className="panel-c p-7">
            <h3 className="font-display text-2xl font-semibold tx1 mb-6">Режим чтения</h3>
            <div className="space-y-6">
              <div>
                <p className="font-mono text-[10px] tracking-[0.22em] uppercase tx3 mb-2.5">Размер текста</p>
                <Seg<FontScale>
                  value={settings.fontScale}
                  onChange={(v) => update({ fontScale: v })}
                  options={[
                    { value: "md", label: "Обычный" },
                    { value: "lg", label: "Крупный" },
                    { value: "xl", label: "Очень крупный" },
                  ]}
                />
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.22em] uppercase tx3 mb-2.5">Ширина колонки</p>
                <Seg<ColumnWidth>
                  value={settings.width}
                  onChange={(v) => update({ width: v })}
                  options={[
                    { value: "narrow", label: "Узкая" },
                    { value: "normal", label: "Средняя" },
                    { value: "wide", label: "Широкая" },
                  ]}
                />
              </div>
              <div className="panel-in p-5">
                <p className={`prose-fantasy !text-[calc(var(--read-size)*0.82)] !leading-[1.75] ${WIDTH_CLASS[settings.width]}`}>
                  В ту ночь ветер принёс запах, какого не бывает у моря: запах гари, сладкий и чужой, будто
                  где-то за горизонтом догорала целая эпоха. Так будет выглядеть ваша страница.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* звук */}
        <Reveal delay={160}>
          <div className="panel-c p-7">
            <h3 className="font-display text-2xl font-semibold tx1 mb-6">Звук</h3>
            <div className="flex items-center gap-4">
              <Icon name="volume" className="w-5 h-5 tx2 shrink-0" />
              <input
                type="range"
                min={0}
                max={100}
                value={settings.volume}
                onChange={(e) => update({ volume: Number(e.target.value) })}
                className="vol w-full"
                style={{ "--fill": `${settings.volume}%` } as React.CSSProperties}
                aria-label="Громкость музыки"
              />
              <span className="font-mono text-[12px] tx2 w-10 text-right">{settings.volume}%</span>
            </div>
            <p className="tx3 text-[13px] mt-3">
              Общая громкость плеера и встроенного эмбиента. Темы настраиваются во вкладке «Музыка».
            </p>
          </div>
        </Reveal>

        {/* данные */}
        <Reveal delay={230}>
          <div className="panel-c p-7">
            <h3 className="font-display text-2xl font-semibold tx1 mb-6">Данные рукописи</h3>
            <p className="tx2 text-[14.5px] leading-relaxed mb-5">
              Главы, персонажи, лор, локации, хроника и положение отряда хранятся в localStorage браузера.
              Экспортируйте их в JSON, чтобы сделать резервную копию или перенести на другую машину.
            </p>
            <div className="flex flex-wrap gap-3">
              <Btn onClick={lib.exportData}>
                <Icon name="download" className="w-4 h-4" /> Экспорт в JSON
              </Btn>
              <ConfirmBtn
                onConfirm={lib.resetData}
                label={<span className="text-sm px-2">Сбросить к демо-данным</span>}
                confirmLabel="Всё пропало?"
                className="border border-[color-mix(in_srgb,var(--danger)_45%,transparent)] rounded-md px-2.5 py-2 text-[var(--danger)]"
              />
            </div>
            <div className="mt-6 pt-5 border-t line-c">
              <p className="font-mono text-[10px] tracking-[0.22em] uppercase tx3 mb-2">Ключи хранилища</p>
              <p className="font-mono text-[12px] tx3 leading-relaxed">
                grim.v2.meta · grim.v2.chapters · grim.v2.characters · grim.v2.lore ·
                grim.v2.locations · grim.v2.events · grim.v2.party · grim.v2.progress · grim.v2.settings
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
