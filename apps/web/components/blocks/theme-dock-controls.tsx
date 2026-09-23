"use client";

import { ChevronUp, Palette, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type PresetValues = {
  baseColor: string;
  radius: string;
  theme: string;
  version: number;
};

type PresetReader = (storage: Pick<Storage, "getItem">) => PresetValues;

type ThemeOption = { label: string; swatch: string; value: string };
type BaseOption = { ink: string; label: string; swatch: string; value: string };
type RadiusOption = { glyph: string; label: string; value: string };

type ThemeDockControlsProps = {
  baseOptions: readonly BaseOption[];
  defaults: PresetValues;
  radiusOptions: readonly RadiusOption[];
  storageKey: string;
  themeOptions: readonly ThemeOption[];
};

const KEY =
  "relative flex h-11 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 text-xs leading-none text-muted-foreground outline-none first:rounded-s-[calc(var(--radius-lg)_-_1px)] last:rounded-e-[calc(var(--radius-lg)_-_1px)] focus-visible:z-[2] focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-foreground aria-pressed:z-[1] aria-pressed:font-medium aria-pressed:text-foreground aria-pressed:shadow-[inset_0_0_0_2px_var(--card),inset_0_0_0_4px_var(--foreground)] aria-pressed:forced-colors:outline-2 aria-pressed:forced-colors:-outline-offset-4 aria-pressed:forced-colors:outline-[Highlight]";
// `bg-border` on the strip shows through the 1px key gaps as hairlines.
const STRIP = "flex rounded-lg border border-border bg-border";

const HUE_HAIRLINE: Record<string, string | undefined> = {
  neutral: "shadow-[inset_0_0_0_1px_var(--border)]",
};
const GLYPH = "inline-block size-[11px] border-[1.5px] border-current border-r-transparent border-b-transparent";

const PANEL_ID = "blocks-theme-panel";

export function ThemeDockControls({ baseOptions, defaults, radiusOptions, storageKey, themeOptions }: ThemeDockControlsProps) {
  const [config, setConfig] = useState<PresetValues | null>(null);
  const [open, setOpen] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLButtonElement>(null);
  const readerRef = useRef<PresetReader | null>(null);
  const readerPromiseRef = useRef<Promise<PresetReader | null> | null>(null);

  const loadReader = () => {
    readerPromiseRef.current ??= import("@sevenui/presets/schema").then(
      ({ readPresetConfig }) => {
        readerRef.current = readPresetConfig;
        return readPresetConfig;
      },
      () => {
        readerPromiseRef.current = null;
        return null;
      },
    );
    return readerPromiseRef.current;
  };

  useEffect(() => {
    let cancelled = false;
    void loadReader().then((read) => {
      if (read && !cancelled) setConfig(read(window.localStorage));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      railRef.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!dockRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const select = (field: "baseColor" | "radius" | "theme", value: string) => {
    const write = (read: PresetReader) => {
      const next: PresetValues = { ...read(window.localStorage), [field]: value };
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      setConfig(next);
    };
    const read = readerRef.current;
    if (read) {
      write(read);
      return;
    }
    void loadReader().then((loaded) => {
      if (loaded) write(loaded);
    });
  };

  const reset = () => {
    window.localStorage.removeItem(storageKey);
    setConfig(defaults);
  };

  const dirty =
    config !== null &&
    (Object.keys(defaults) as (keyof PresetValues)[]).some((field) => field !== "version" && config[field] !== defaults[field]);

  const themeLabel = themeOptions.find((option) => option.value === config?.theme)?.label ?? "";
  const baseLabel = baseOptions.find((option) => option.value === config?.baseColor)?.label ?? "";
  const radiusOption = radiusOptions.find((option) => option.value === config?.radius);
  const capSwatch = themeOptions.find((option) => option.value === (config?.theme ?? defaults.theme))?.swatch;

  const defaultThemeLabel = themeOptions.find((option) => option.value === defaults.theme)?.label;
  const defaultBaseLabel = baseOptions.find((option) => option.value === defaults.baseColor)?.label;
  const defaultRadius = radiusOptions.find((option) => option.value === defaults.radius);

  return (
    <div
      className="pointer-events-auto absolute bottom-0 left-6 right-6 flex flex-col items-start gap-2 lg:left-10 lg:right-auto"
      data-customizer=""
      ref={dockRef}
    >
      <div
        className="w-full origin-bottom-left rounded-xl border border-border bg-card p-4 text-foreground shadow-[0_24px_56px_-12px_rgb(0_0_0/0.26),0_4px_12px_-4px_rgb(0_0_0/0.12)] max-lg:max-h-[70dvh] max-lg:overflow-y-auto lg:w-90"
        hidden={!open}
        id={PANEL_ID}
      >
        <div className="flex items-baseline gap-2 border-b border-border pb-3">
          <h2 className="text-sm font-semibold tracking-tight">Customize</h2>
          <p className="ml-auto text-xs text-muted-foreground">Preview every block in your theme.</p>
        </div>

        {/* biome-ignore lint/a11y/useSemanticElements: a <fieldset> brings its own border and min-width into the dock */}
        <div aria-labelledby="blocks-theme-legend" className="mt-3.5" role="group">
          <div className="mb-1.5 flex items-baseline gap-2" id="blocks-theme-legend">
            <span className="text-xs font-medium text-muted-foreground">Theme</span>
            <span className="ml-auto text-xs font-medium text-foreground">{themeLabel}</span>
          </div>
          <div className={STRIP}>
            {themeOptions.map((option, index) => (
              <button
                aria-pressed={config?.theme === option.value}
                className={`${KEY} ${HUE_HAIRLINE[option.value] ?? ""} ${index > 0 ? "ml-px" : ""}`}
                key={option.value}
                onClick={() => select("theme", option.value)}
                style={{ background: option.swatch }}
                type="button"
              >
                <span className="sr-only">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* biome-ignore lint/a11y/useSemanticElements: a <fieldset> brings its own border and min-width into the dock */}
        <div aria-labelledby="blocks-base-legend" className="mt-3.5" role="group">
          <div className="mb-1.5 flex items-baseline gap-2" id="blocks-base-legend">
            <span className="text-xs font-medium text-muted-foreground">Base color</span>
            <span className="ml-auto text-xs font-medium text-foreground">{baseLabel}</span>
          </div>
          <div className={STRIP}>
            {baseOptions.map((option) => (
              <button
                aria-pressed={config?.baseColor === option.value}
                className={`${KEY} text-[11px]`}
                key={option.value}
                onClick={() => select("baseColor", option.value)}
                style={{ background: option.swatch, color: option.ink }}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* biome-ignore lint/a11y/useSemanticElements: a <fieldset> brings its own border and min-width into the dock */}
        <div aria-labelledby="blocks-radius-legend" className="mt-3.5" role="group">
          <div className="mb-1.5 flex items-baseline gap-2" id="blocks-radius-legend">
            <span className="text-xs font-medium text-muted-foreground">Radius</span>
            <span className="ml-auto text-xs font-medium text-foreground">{radiusOption?.label ?? ""}</span>
          </div>
          <div className={STRIP}>
            {radiusOptions.map((option, index) => (
              <button
                aria-pressed={config?.radius === option.value}
                className={`${KEY} bg-card ${index > 0 ? "ml-px" : ""}`}
                key={option.value}
                onClick={() => select("radius", option.value)}
                type="button"
              >
                <span aria-hidden="true" className={GLYPH} style={{ borderTopLeftRadius: option.glyph }} />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <button
          className="mt-3.5 flex h-11 w-full cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:pointer-events-none disabled:opacity-50"
          disabled={!dirty}
          onClick={reset}
          type="button"
        >
          <RotateCcw aria-hidden="true" className="size-[15px] text-muted-foreground" />
          Reset all three
          <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            {defaultThemeLabel}
            <span aria-hidden="true">·</span>
            {defaultBaseLabel}
            <span aria-hidden="true">·</span>
            <span aria-hidden="true" className={GLYPH} style={{ borderTopLeftRadius: defaultRadius?.glyph }} />
            {defaultRadius?.label}
          </span>
        </button>
      </div>

      <button
        aria-controls={PANEL_ID}
        aria-expanded={open}
        aria-label={
          config === null
            ? undefined
            : `Customize theme — ${config.theme} theme, ${config.baseColor} base color, ${config.radius} radius`
        }
        className="flex h-12 cursor-pointer items-stretch overflow-hidden rounded-full border border-border bg-card outline-none shadow-[0_10px_24px_-6px_rgb(0_0_0/0.18),0_2px_6px_-2px_rgb(0_0_0/0.10)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground lg:h-11"
        onClick={() => setOpen((value) => !value)}
        ref={railRef}
        type="button"
      >
        <span className="grid w-12 flex-none place-items-center border-r border-border lg:w-11" style={{ background: capSwatch }}>
          <Palette aria-hidden="true" className="size-4 text-background opacity-90" />
        </span>
        <span className="flex flex-col justify-center gap-px py-0 pl-3 pr-2.5 text-left">
          <span className="text-[13px] font-medium leading-[1.15] text-foreground">Customize</span>
          <span
            aria-hidden="true"
            className="flex items-center gap-1.5 whitespace-nowrap text-[11px] leading-[1.25] text-muted-foreground"
          >
            <span>{themeLabel}</span>
            <span>·</span>
            <span>{baseLabel}</span>
            <span>·</span>
            <span className={GLYPH} style={{ borderTopLeftRadius: radiusOption?.glyph }} />
            <span>{radiusOption?.label ?? ""}</span>
          </span>
        </span>
        <ChevronUp
          aria-hidden="true"
          className="mr-3 ml-0.5 size-3.5 self-center text-muted-foreground transition-transform duration-150 motion-reduce:transition-none"
          style={{ transform: open ? "rotate(180deg)" : undefined }}
        />
      </button>
    </div>
  );
}
