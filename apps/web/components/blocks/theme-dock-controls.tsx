"use client";

import { ChevronUp, Palette, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * The interactive half of the /blocks theme dock. `theme-dock.tsx` is the
 * server half and the entry point; read its header first for what the dock is
 * and why it is split at all.
 *
 * THIS FILE MUST NEVER IMPORT `@sevenui/presets` AT THE TOP LEVEL. Not the
 * package root, not `/presets`, not `/schema`, and not for a zod-free named
 * export either: `schema.ts` runs `import { z } from "zod"` unconditionally at
 * module load, and `presets.ts` imports `./schema` unconditionally in turn, so
 * any module-level import of either subpath pulls the whole zod runtime into
 * whatever browser bundle reaches this file. `components/preset-scope.tsx`'s
 * header carries the three measurements, in the order they were taken: +86 KB
 * gzip in the docs pages' first-load set with a dedicated ~409 KB chunk; still
 * ~404 KB after swapping the schema import for a hand-written local reader
 * (which is why a local re-implementation is pure downside and was reverted
 * once already); and gone from the eager set entirely once both subpaths moved
 * behind a dynamic `import()` in an effect. That last shape is what the effect
 * below follows.
 *
 * Only `readPresetConfig` — a tolerant parse this file has no business
 * duplicating — actually needs that import. Everything else the browser needs
 * is plain data the server already has, so it arrives as props: the storage
 * key, the defaults, and the three option lists with their resolved colours
 * and glyphs.
 *
 * WHAT THE ASTRO SCRIPT DID THAT THIS DOES NOT. The source re-bound itself on
 * every `astro:page-load` and guarded with a `data-bound` flag. Both are
 * DELETED rather than ported: they existed because Astro's ClientRouter runs a
 * module once and the swapped-in dock afterwards is a fresh element with no
 * listeners, so the script had to re-find its own DOM and defend against
 * double-binding. There is no ClientRouter here — React owns the element's
 * lifetime, and an effect's cleanup runs on unmount — so re-binding would be a
 * second bind, not a repair. The source's comment naming another page's
 * workaround for the same trap did not come along either: that symbol exists
 * nowhere in this repository.
 *
 * Likewise the `querySelector` plumbing. `[data-panel]`, `[data-rail]`,
 * `[data-cap]`, `[data-chevron]`, `[data-rail-glyph]`, `[data-readout]`,
 * `[data-rail-readout]` and `button[data-field]` were all carrying a value
 * from the frontmatter to the script across a boundary that does not exist in
 * React, where the value is simply a variable in scope. They are gone. The one
 * data attribute kept is `data-customizer`, which is the dock's public handle
 * on the rendered page.
 *
 * DECISIONS THE MARKUP ENCODES, each recorded because someone will otherwise
 * undo it:
 *   - Selected state is styled off `aria-pressed` alone, never a mirrored
 *     `data-active`. Two sources of truth for one state is how the half you
 *     can see keeps working while the ARIA half silently rots.
 *   - The panel is NON-MODAL by design: no scrim, no focus trap. The whole
 *     point of the control is that the previews behind it stay on screen and
 *     keep re-theming, so the page underneath must stay interactive. Escape
 *     closes it and returns focus to the rail; an outside pointerdown closes
 *     it.
 *   - The readouts mirror the pressed key's own label — both come from the one
 *     option list — rather than a second label map living here, so adding a
 *     preset can never desync the two.
 *   - Reset REMOVES the key rather than writing the defaults into it, and is
 *     enabled exactly when the stored config differs from the defaults on any
 *     field but `version`.
 *
 * Nothing is read from storage while rendering, so the markup this produces on
 * the server is the markup the browser hydrates: no key pressed, the readouts
 * empty, Reset disabled, and the rail's cap wearing the default theme's
 * colour. The effect fills all of that in on mount — which is exactly the
 * sequence the shipped Astro page goes through, since its own script runs
 * after the same markup has already painted.
 */

type PresetValues = {
  baseColor: string;
  radius: string;
  theme: string;
  version: number;
};

// The tolerant parse, as the client sees it. Declaring the shape locally is
// free (types are erased) and keeps the package's name out of every import
// position in this file — see the header.
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

// One shared key geometry: every control in the panel is a 44px cell in a
// bordered strip, pressed the same way. `shadow-*` carries the pressed state
// as a double inset frame (2px card, then 2px foreground) painted INSIDE the
// cell, so it reads against yellow (0.852) and neutral (0.205) alike and the
// cell's footprint never moves — a ring-offset would inflate the selected
// swatch and break the row's rhythm.
//
// The strip deliberately does NOT clip. Faking its corners with
// `overflow-hidden` left every key square, so the pressed frame — which
// `border-radius` shapes, but the key had none — landed as a hard rectangle
// inside a soft pill at either end. Instead each key owns the corner it sits
// in (`first:` the start side, `last:` the end side, middles square), at the
// strip's radius minus the 1px of its own edge, which makes the strip arc, the
// key, the pressed frame and the focus indicator concentric. Keep that radius a
// `calc()`: hardcoding today's 9px would silently reopen the mismatch the
// moment `--radius` changes.
const KEY =
  "relative flex h-11 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 text-xs leading-none text-muted-foreground outline-none first:rounded-s-[calc(var(--radius-lg)_-_1px)] last:rounded-e-[calc(var(--radius-lg)_-_1px)] focus-visible:z-[2] focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-foreground aria-pressed:z-[1] aria-pressed:font-medium aria-pressed:text-foreground aria-pressed:shadow-[inset_0_0_0_2px_var(--card),inset_0_0_0_4px_var(--foreground)] aria-pressed:forced-colors:outline-2 aria-pressed:forced-colors:-outline-offset-4 aria-pressed:forced-colors:outline-[Highlight]";
// `bg-border` on the strip shows through the 1px key gaps as hairlines.
const STRIP = "flex rounded-lg border border-border bg-border";

// The per-hue hairline is neutral's alone. On every other hue it just doubles
// the strip's own edge into 3px of grout, which is what made eight hues read
// as eight separate tiles instead of one band — but neutral's fill (0.205) IS
// `--card` in dark mode, so without it that key becomes an empty slot rather
// than a swatch.
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
  // The tolerant reader, once its chunk has landed. Refs rather than state:
  // nothing in the markup depends on whether the chunk has arrived, only on
  // the config it produces, and the click handlers want the freshest stored
  // value the same way the source's `sync` re-read storage on every pass.
  //
  // `readerPromiseRef` closes a race the Astro original could not have. That
  // script bound its listeners only after its STATIC import had run, so there
  // was no window in which a key could be pressed with no reader in hand.
  // Here the dock is interactive from hydration, and a visitor quick enough to
  // open the rail and press a key before the chunk lands would otherwise have
  // merged onto the DEFAULTS — silently discarding a stored baseColor or
  // radius that had merely not been read yet. So a press inside that window is
  // DEFERRED onto the same in-flight promise the mount effect already started
  // (memoized, so it is never a second request) and applied against the real
  // stored config the moment one can be read.
  //
  // A FAILED load must not poison the memo. `??=` treats a rejected promise as
  // present, so caching one would leave every later press waiting on a promise
  // that can never settle: `config` would stay null and the panel would be
  // dead for the life of the page. The rejection branch therefore clears the
  // memo, letting the NEXT press start one fresh attempt — one, on its own;
  // there is deliberately no retry loop and no backoff — and resolves to
  // `null` instead of rethrowing, so no caller has to carry a `.catch` and
  // nothing is ever left unhandled. A caller that gets `null` simply does
  // nothing, which is what the Astro original did when its own module script
  // failed to load, and there is no error UI here for the same reason there is
  // none there. Nothing is lost diagnostically either: the browser already
  // reports the failed chunk request itself.
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

  // Every write merges onto what storage ACTUALLY holds, read through the
  // tolerant parse — never onto `config`, and never onto `defaults`. If the
  // reader is already here the merge is synchronous, which is the case for
  // every press after the first few hundred milliseconds of a page's life; if
  // it is not, the press waits for it rather than guessing.
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

  // Reset needs no reader: removing the key IS the operation, and what any
  // preview reads back afterwards is the tolerant parse's own fallback. It can
  // never derive a config from a half-known state, and the button is disabled
  // until `config` exists in any case.
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
  // The cap always wears a real colour, so the collapsed dock is saturated
  // from the very first paint rather than after the effect lands.
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
        {/* The cap wears the current primary, so the collapsed dock is the only
            saturated object on an otherwise monochrome page — the
            discoverability bet this placement makes. */}
        <span className="grid w-12 flex-none place-items-center border-r border-border lg:w-11" style={{ background: capSwatch }}>
          <Palette aria-hidden="true" className="size-4 text-background opacity-90" />
        </span>
        <span className="flex flex-col justify-center gap-px py-0 pl-3 pr-2.5 text-left">
          <span className="text-[13px] font-medium leading-[1.15] text-foreground">Customize</span>
          {/* Collapsed, the rail IS the state readout — presentation of the
              three existing fields, not a fourth control. */}
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
        {/* The rotation is written as a style declaration, not a rotate
            utility, to match what the source produced: Tailwind v4 emits
            `rotate` as its own CSS property rather than through the
            `transform` shorthand, so the two are not interchangeable if
            anything ever reads the computed value back. */}
        <ChevronUp
          aria-hidden="true"
          className="mr-3 ml-0.5 size-3.5 self-center text-muted-foreground transition-transform duration-150 motion-reduce:transition-none"
          style={{ transform: open ? "rotate(180deg)" : undefined }}
        />
      </button>
    </div>
  );
}
