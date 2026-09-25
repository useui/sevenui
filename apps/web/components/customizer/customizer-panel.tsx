"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { RotateCcw, X } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Switch } from "@/registry/base/ui/switch";
import { usePresetScope } from "../preset-scope";
import { PRESET_SCOPE_ATTR } from "../preset-scope-attr";
import { TOOLBAR_ICON } from "../toolbar-classes";
import { type PresetField, useCustomizer } from "./customizer-state";

export const CUSTOMIZER_PANEL_ID = "theme-customizer-panel";

// Every option in every group is the same key: a glyph over a label. Checked draws a 2px
// foreground rim (border + inset ring) so the state reads without relying on color alone.
const KEY =
  "group/key relative flex h-14 min-w-0 cursor-pointer select-none flex-col items-center justify-center gap-2 rounded-md border border-border bg-background px-1 text-[11px] leading-none text-muted-foreground outline-none transition-[border-color,background-color,color,box-shadow] duration-150 hover:border-foreground/25 hover:bg-muted/50 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-checked:border-foreground data-checked:font-medium data-checked:text-foreground data-checked:shadow-[inset_0_0_0_1px_var(--foreground)] data-checked:hover:bg-background forced-colors:data-checked:outline-2 forced-colors:data-checked:-outline-offset-4 forced-colors:data-checked:outline-[Highlight] motion-reduce:transition-none";

// Base and radius glyphs settle a touch larger once chosen: the one moving part in the panel.
const GLYPH =
  "shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-data-checked/key:scale-[1.15] motion-reduce:transition-none";
// Light swatches vanish on a white panel and the neutral one on a dark panel; a faint rim keeps both.
const RIM = "outline outline-1 -outline-offset-1 outline-foreground/15 dark:outline-foreground/40";

// Enter on an expo-out so the panel lands softly; leave faster than it came.
const SLIDE =
  "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] data-starting-style:-translate-x-full data-ending-style:-translate-x-full data-ending-style:duration-200 data-ending-style:ease-[cubic-bezier(0.7,0,0.84,0)] rtl:data-starting-style:translate-x-full rtl:data-ending-style:translate-x-full motion-reduce:transition-none";

function Group({
  children,
  columns,
  field,
  label,
  readout,
  value,
}: {
  children: ReactNode;
  columns: string;
  field: PresetField;
  label: string;
  readout: string;
  value: string;
}) {
  const { select } = useCustomizer();
  const id = `customizer-${field}`;
  return (
    <div>
      <div className="mb-2 flex items-baseline gap-2">
        <span className="text-xs font-medium text-muted-foreground" id={id}>
          {label}
        </span>
        {/* The readout repeats the checked key in words, so arrowing through a group reads back here too. */}
        <span aria-hidden="true" className="ml-auto text-xs font-medium text-foreground">
          {readout}
        </span>
      </div>
      <RadioGroup
        aria-labelledby={id}
        className={`grid gap-1.5 ${columns}`}
        onValueChange={(next) => select(field, next as string)}
        value={value}
      >
        {children}
      </RadioGroup>
    </div>
  );
}

/**
 * A small card drawn inside the preset scope, so it resolves the chosen tokens exactly as the page
 * previews do: the stage is the base color's muted, the badge, switch and button carry the theme,
 * and every corner follows the radius.
 */
function Specimen() {
  usePresetScope();
  return (
    <div
      aria-hidden="true"
      className="flex min-h-36 flex-1 items-center justify-center bg-muted px-5 py-6 text-foreground"
      inert
      {...{ [PRESET_SCOPE_ATTR]: "" }}
    >
      <div className="w-full max-w-72 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-[0_8px_24px_-16px_rgb(0_0_0/0.25)]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Release notes</span>
          <Badge className="ml-auto">New</Badge>
        </div>
        <div className="mt-1.5 flex items-center gap-3">
          <span className="text-pretty text-xs text-muted-foreground">Email me when a block ships.</span>
          <Switch checked className="ml-auto" />
        </div>
        <div className="mt-4 flex gap-2">
          <Input className="h-8 min-w-0 text-xs md:text-xs" defaultValue="you@example.com" readOnly tabIndex={-1} />
          <Button tabIndex={-1}>Subscribe</Button>
        </div>
      </div>
    </div>
  );
}

/**
 * The page's single customizer: a tool panel docked under the header on the left. It never dims
 * or locks the page on desktop, because the point is watching the previews change beside it.
 * A live specimen fills the space above the controls; the three groups are real radio groups, so
 * Tab moves between them and the arrow keys move within one.
 */
export function CustomizerPanel() {
  const { baseOptions, config, defaults, dirty, open, radiusOptions, reset, setOpen, themeOptions, triggerRef } =
    useCustomizer();

  const labelOf = (options: readonly { label: string; value: string }[], value: string | undefined) =>
    options.find((option) => option.value === value)?.label ?? "";

  const defaultSummary = [
    labelOf(themeOptions, defaults.theme),
    labelOf(baseOptions, defaults.baseColor),
    labelOf(radiusOptions, defaults.radius),
  ].join(", ");

  return (
    <Dialog.Root disablePointerDismissal modal={false} onOpenChange={setOpen} open={open}>
      <Dialog.Portal>
        {/* Phones get a scrim: the panel covers most of the screen, and a tap beside it should close it. */}
        {/* Gone the moment it closes, so it never swallows a click while the panel slides out. */}
        {open && (
          <button
            aria-hidden="true"
            className="fixed inset-x-0 top-16 bottom-0 z-[37] cursor-default bg-black/30 lg:hidden"
            onClick={() => setOpen(false)}
            tabIndex={-1}
            type="button"
          />
        )}
        <Dialog.Popup
          className={`fixed start-0 top-16 bottom-0 z-[38] flex w-[min(23rem,calc(100vw-3rem))] flex-col border-e border-border bg-background text-foreground shadow-[16px_0_40px_-24px_rgb(0_0_0/0.28)] outline-none ${SLIDE}`}
          finalFocus={triggerRef}
          id={CUSTOMIZER_PANEL_ID}
        >
          <div className="flex items-start gap-3 px-5 py-4">
            <div className="min-w-0">
              <Dialog.Title className="text-sm font-semibold tracking-tight">Customize</Dialog.Title>
              <Dialog.Description className="mt-0.5 text-pretty text-xs text-muted-foreground">
                Every preview on this page follows your picks.
              </Dialog.Description>
            </div>
            <Dialog.Close className={`${TOOLBAR_ICON} ml-auto inline-flex`}>
              <span className="sr-only">Close the customizer</span>
              <X aria-hidden="true" className="size-4" strokeWidth={1.5} />
            </Dialog.Close>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {/* The border lives outside the scope so the frame keeps the site's color, not the preset's. */}
            <div className="flex min-h-36 flex-1 flex-col border-y border-border">
              <Specimen />
            </div>

            <div className="flex shrink-0 flex-col gap-5 px-5 py-5">
              <Group
                columns="grid-cols-4"
                field="theme"
                label="Theme"
                readout={labelOf(themeOptions, config?.theme)}
                value={config?.theme ?? ""}
              >
                {themeOptions.map((option) => (
                  <Radio.Root className={KEY} key={option.value} value={option.value}>
                    {/* Neutral's swatch is near-black; the site's own primary keeps it legible on a dark panel. */}
                    <span
                      aria-hidden="true"
                      className={`${RIM} h-4 w-[calc(100%-1rem)] shrink-0 rounded-[3px] ${option.value === "neutral" ? "bg-primary" : ""}`}
                      style={option.value === "neutral" ? undefined : { background: option.swatch }}
                    />
                    <span className="max-w-full truncate">{option.label}</span>
                  </Radio.Root>
                ))}
              </Group>

              <Group
                columns="grid-cols-5"
                field="baseColor"
                label="Base color"
                readout={labelOf(baseOptions, config?.baseColor)}
                value={config?.baseColor ?? ""}
              >
                {baseOptions.map((option) => (
                  <Radio.Root className={KEY} key={option.value} value={option.value}>
                    {/* Text on surface: the base's foreground set on its muted, the pair it tints. */}
                    <span
                      aria-hidden="true"
                      className={`${GLYPH} ${RIM} flex h-4 w-6 items-center justify-center rounded-[3px] text-[9px] font-semibold tracking-tight`}
                      style={{ background: option.swatch, color: option.ink }}
                    >
                      Aa
                    </span>
                    <span className="max-w-full truncate">{option.label}</span>
                  </Radio.Root>
                ))}
              </Group>

              <Group
                columns="grid-cols-4"
                field="radius"
                label="Radius"
                readout={labelOf(radiusOptions, config?.radius)}
                value={config?.radius ?? ""}
              >
                {radiusOptions.map((option) => (
                  <Radio.Root className={KEY} key={option.value} value={option.value}>
                    <span
                      aria-hidden="true"
                      className={`${GLYPH} size-5 border-[1.5px] border-current border-r-transparent border-b-transparent`}
                      style={{ borderTopLeftRadius: `calc(${option.glyph} * 2.5)` }}
                    />
                    <span className="max-w-full truncate">{option.label}</span>
                  </Radio.Root>
                ))}
              </Group>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-border px-5 py-3">
            <p aria-live="polite" className="min-w-0 text-pretty text-xs text-muted-foreground">
              {dirty ? "Saved in this browser." : "Using the default preset."}
            </p>
            <button
              aria-label={`Reset to ${defaultSummary}`}
              className="ml-auto inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-default disabled:text-muted-foreground disabled:opacity-60 disabled:hover:bg-background"
              disabled={!dirty}
              onClick={reset}
              title={`Defaults: ${defaultSummary}`}
              type="button"
            >
              <RotateCcw aria-hidden="true" className="size-3.5" />
              Reset
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
