"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Popover } from "@base-ui/react/popover";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Toolbar } from "@base-ui/react/toolbar";
import { Dices, Moon, RotateCcw, Sparkles, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { type KeyboardEvent, type ReactNode, useMemo, useRef, useState } from "react";
import { Kbd } from "@/registry/base/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/registry/base/ui/tooltip";
import { useAnnounce } from "../announcer";
import { DOCK_POSITION, DOCK_SURFACE } from "./customizer-launcher";
import { CUSTOMIZER_DOCK_ID, useCustomizer } from "./customizer-state";

type Axis = "baseColor" | "looks" | "radius" | "theme";

const AXIS_TITLE: Record<Axis, string> = {
  looks: "Looks",
  theme: "Theme",
  baseColor: "Base color",
  radius: "Radius",
};

// One tray serves all four axes: the dock's buttons are detached triggers of the same popover, so
// moving from Theme to Radius swaps the tray's content instead of closing one popup and opening another.
const tray = Popover.createHandle<Axis>();

const ITEM =
  "inline-flex h-9 shrink-0 cursor-pointer select-none items-center justify-center rounded-full text-[13px] font-medium text-muted-foreground outline-none transition-[color,background-color] duration-150 hover:bg-foreground/[0.06] hover:text-foreground focus-visible:focus-ring focus-visible:[--focus-gap:0px] data-popup-open:bg-foreground/[0.08] data-popup-open:text-foreground data-disabled:cursor-default data-disabled:opacity-40 data-disabled:hover:bg-transparent data-disabled:hover:text-muted-foreground motion-reduce:transition-none";
const ICON_ITEM = `${ITEM} w-9`;
const AXIS_ITEM = `${ITEM} gap-2 px-2.5 sm:ps-2 sm:pe-3`;
const SEPARATOR = "mx-1 h-5 w-px shrink-0 bg-hairline-strong";

// An option is a glyph over its name. Checked is drawn as a filled, hairline-ringed cell and a
// heavier label, so the state never rests on colour alone.
const OPTION =
  "group/option flex min-w-0 cursor-pointer select-none flex-col items-center gap-2 rounded-xl px-1 pt-2.5 pb-2 text-[11px] leading-none text-muted-foreground outline-none transition-[color,background-color,box-shadow] duration-150 hover:bg-foreground/[0.05] hover:text-foreground focus-visible:focus-ring focus-visible:[--focus-gap:0px] data-checked:bg-foreground/[0.07] data-checked:font-medium data-checked:text-foreground data-checked:shadow-[inset_0_0_0_1px_var(--hairline-strong)] forced-colors:data-checked:outline-2 forced-colors:data-checked:-outline-offset-2 forced-colors:data-checked:outline-[Highlight] motion-reduce:transition-none";

// Light swatches vanish on a white surface and the neutral one on a dark surface; a faint rim keeps both.
const RIM = "outline outline-1 -outline-offset-1 outline-foreground/15 dark:outline-foreground/40";

// The dock grows out of the launcher's spot and settles; it leaves faster than it came.
const DOCK_MOTION =
  "origin-bottom transition-[opacity,scale,translate] duration-200 ease-snappy data-starting-style:translate-y-2 data-starting-style:scale-90 data-starting-style:opacity-0 data-ending-style:translate-y-2 data-ending-style:scale-95 data-ending-style:opacity-0 data-ending-style:duration-150 motion-reduce:transition-none";
const TRAY_MOTION =
  "origin-bottom transition-[opacity,scale,translate] duration-150 ease-snappy data-starting-style:translate-y-1 data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-ending-style:translate-y-1 data-ending-style:scale-[0.98] data-ending-style:opacity-0 motion-reduce:transition-none";

function ThemeGlyph({ className = "size-4", swatch, value }: { className?: string; swatch: string; value: string }) {
  // Neutral's swatch is near-black; the site's own primary keeps it legible on a dark surface.
  const neutral = value === "neutral";
  return (
    <span
      aria-hidden="true"
      className={`${RIM} ${className} shrink-0 rounded-full ${neutral ? "bg-primary" : ""}`}
      style={neutral ? undefined : { background: swatch }}
    />
  );
}

/** Text on surface: the base's foreground set on its muted, the pair it tints. */
function BaseGlyph({ className = "h-4 w-5 text-[8px]", ink, swatch }: { className?: string; ink: string; swatch: string }) {
  return (
    <span
      aria-hidden="true"
      className={`${RIM} ${className} flex shrink-0 items-center justify-center rounded-[4px] font-semibold tracking-tight`}
      style={{ background: swatch, color: ink }}
    >
      Aa
    </span>
  );
}

function RadiusGlyph({ className = "size-3.5", glyph }: { className?: string; glyph: string }) {
  return (
    <span
      aria-hidden="true"
      className={`${className} shrink-0 border-[1.5px] border-current border-r-transparent border-b-transparent`}
      style={{ borderTopLeftRadius: `calc(${glyph} * 2)` }}
    />
  );
}

/** A button with a hover hint and, where it has one, its shortcut key. */
function Hint({ children, label, shortcut }: { children: React.ReactElement; label: string; shortcut?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side="top" sideOffset={12}>
        {label}
        {shortcut ? <Kbd className="ms-1.5">{shortcut}</Kbd> : null}
      </TooltipContent>
    </Tooltip>
  );
}

function Options({
  axis,
  children,
  columns,
  onValueChange,
  value,
}: {
  axis: Axis;
  children: ReactNode;
  columns: string;
  onValueChange: (value: string) => void;
  value: string;
}) {
  return (
    <RadioGroup
      aria-label={AXIS_TITLE[axis]}
      className={`grid gap-1 ${columns}`}
      onValueChange={(next) => onValueChange(next as string)}
      value={value}
    >
      {children}
    </RadioGroup>
  );
}

/**
 * The page's single customizer: a floating dock at the bottom centre of the viewport. Nothing is
 * covered or dimmed, because the point is watching the previews change while you pick. Each axis
 * is one press away: its button opens a tray of options right above the dock, and the arrow keys
 * try them live. Looks set all three axes at once and Shuffle rolls a new combination.
 */
export function CustomizerDock() {
  const {
    apply,
    baseOptions,
    config,
    defaults,
    dirty,
    looks,
    open,
    radiusOptions,
    reset,
    select,
    setOpen,
    themeOptions,
    triggerRef,
  } = useCustomizer();
  // The header toggle's job, from inside the dock: the same next-themes switch for the whole site.
  // Mounted only on the client (the dock loads lazily), so resolvedTheme is already known here.
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const announce = useAnnounce();
  const dockRef = useRef<HTMLDivElement | null>(null);
  const [trayOpen, setTrayOpen] = useState(false);
  const [trayTrigger, setTrayTrigger] = useState<string | null>(null);
  const [rolls, setRolls] = useState(0);

  const current = config ?? defaults;
  const theme = themeOptions.find((option) => option.value === current.theme);
  const base = baseOptions.find((option) => option.value === current.baseColor);
  const radius = radiusOptions.find((option) => option.value === current.radius);
  const look = looks.find(
    (option) =>
      option.theme === current.theme && option.baseColor === current.baseColor && option.radius === current.radius,
  );

  const describe = (values: { baseColor: string; radius: string; theme: string }) =>
    [
      `${themeOptions.find((option) => option.value === values.theme)?.label} theme`,
      `${baseOptions.find((option) => option.value === values.baseColor)?.label} base color`,
      `${radiusOptions.find((option) => option.value === values.radius)?.label} radius`,
    ].join(", ");

  const defaultSummary = useMemo(
    () =>
      [
        themeOptions.find((option) => option.value === defaults.theme)?.label,
        baseOptions.find((option) => option.value === defaults.baseColor)?.label,
        radiusOptions.find((option) => option.value === defaults.radius)?.label,
      ].join(", "),
    [baseOptions, defaults, radiusOptions, themeOptions],
  );

  const shuffle = () => {
    // Never land on what is already showing: a roll that changes nothing reads as a broken button.
    const pick = <T extends { value: string }>(options: readonly T[], not?: string) => {
      const pool = not === undefined ? options : options.filter((option) => option.value !== not);
      return pool[Math.floor(Math.random() * pool.length)].value;
    };
    const next = {
      theme: pick(themeOptions, current.theme),
      baseColor: pick(baseOptions),
      radius: pick(radiusOptions),
    };
    apply(next);
    setRolls((count) => count + 1);
    announce(describe(next));
  };

  const toggleMode = () => {
    setTheme(dark ? "light" : "dark");
    announce(dark ? "Light mode" : "Dark mode");
  };

  const resetAll = () => {
    reset();
    announce(`Reset to ${defaultSummary}`);
  };

  // Single-key shortcuts, live only while focus is in the dock or its tray, so typing in a preview
  // on the page never triggers them.
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    const key = event.key.toLowerCase();
    if (key === "s") shuffle();
    else if (key === "m") toggleMode();
    else if (key === "r" && dirty) resetAll();
    else return;
    event.preventDefault();
  };

  const axisTrigger = (axis: Axis) => (
    <Popover.Trigger handle={tray} id={`customizer-axis-${axis}`} payload={axis} />
  );

  return (
    <Dialog.Root
      disablePointerDismissal
      modal={false}
      onOpenChange={(next) => {
        if (!next) setTrayOpen(false);
        setOpen(next);
      }}
      open={open}
    >
      <Dialog.Portal>
        <Dialog.Popup
          className={`${DOCK_POSITION} ${DOCK_SURFACE} ${DOCK_MOTION} max-w-[calc(100vw-1rem)] rounded-full p-1 outline-none print:hidden`}
          finalFocus={triggerRef}
          id={CUSTOMIZER_DOCK_ID}
          onKeyDown={onKeyDown}
          ref={dockRef}
        >
          <Dialog.Title className="sr-only">Customize</Dialog.Title>
          <Dialog.Description className="sr-only">
            Every preview on this page follows your picks. They are saved in this browser.
          </Dialog.Description>

          <Toolbar.Root aria-label="Theme customizer" className="flex items-center">
            <Toolbar.Button aria-label="Looks" className={`${ITEM} w-9 sm:w-auto sm:gap-1.5 sm:ps-2.5 sm:pe-3`} render={axisTrigger("looks")}>
              <Sparkles aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
              <span aria-hidden="true" className="hidden text-foreground sm:inline">
                Looks
              </span>
            </Toolbar.Button>

            <span aria-hidden="true" className={SEPARATOR} />

            <Toolbar.Button aria-label={`Theme: ${theme?.label}`} className={AXIS_ITEM} render={axisTrigger("theme")}>
              {theme ? <ThemeGlyph swatch={theme.swatch} value={theme.value} /> : null}
              <span aria-hidden="true" className="hidden text-foreground sm:inline">
                {theme?.label}
              </span>
            </Toolbar.Button>
            <Toolbar.Button aria-label={`Base color: ${base?.label}`} className={AXIS_ITEM} render={axisTrigger("baseColor")}>
              {base ? <BaseGlyph ink={base.ink} swatch={base.swatch} /> : null}
              <span aria-hidden="true" className="hidden text-foreground sm:inline">
                {base?.label}
              </span>
            </Toolbar.Button>
            <Toolbar.Button aria-label={`Radius: ${radius?.label}`} className={AXIS_ITEM} render={axisTrigger("radius")}>
              {radius ? <RadiusGlyph glyph={radius.glyph} /> : null}
              <span aria-hidden="true" className="hidden text-foreground sm:inline">
                {radius?.label}
              </span>
            </Toolbar.Button>

            <span aria-hidden="true" className={SEPARATOR} />

            <Hint label="Shuffle" shortcut="S">
              <Toolbar.Button aria-label="Shuffle a new combination" className={ICON_ITEM} onClick={shuffle}>
                <Dices
                  aria-hidden="true"
                  className="size-4 transition-[rotate] duration-300 ease-spring motion-reduce:transition-none"
                  strokeWidth={1.75}
                  style={{ rotate: `${rolls * 90}deg` }}
                />
              </Toolbar.Button>
            </Hint>
            <Hint label={dark ? "Switch to light mode" : "Switch to dark mode"} shortcut="M">
              <Toolbar.Button
                aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
                className={ICON_ITEM}
                onClick={toggleMode}
              >
                {dark ? (
                  <Moon aria-hidden="true" className="size-4" strokeWidth={1.75} />
                ) : (
                  <Sun aria-hidden="true" className="size-4" strokeWidth={1.75} />
                )}
              </Toolbar.Button>
            </Hint>
            <Hint label={dirty ? `Reset to ${defaultSummary}` : "Using the default preset"} shortcut={dirty ? "R" : undefined}>
              <Toolbar.Button aria-label={`Reset to ${defaultSummary}`} className={ICON_ITEM} disabled={!dirty} onClick={resetAll}>
                <RotateCcw aria-hidden="true" className="size-4" strokeWidth={1.75} />
              </Toolbar.Button>
            </Hint>

            <span aria-hidden="true" className={SEPARATOR} />

            <Hint label="Close" shortcut="Esc">
              <Toolbar.Button aria-label="Close the customizer" className={ICON_ITEM} render={<Dialog.Close />}>
                <X aria-hidden="true" className="size-4" strokeWidth={1.75} />
              </Toolbar.Button>
            </Hint>
          </Toolbar.Root>

          <Popover.Root
            handle={tray}
            onOpenChange={(next, details) => {
              setTrayOpen(next);
              if (next) setTrayTrigger(details.trigger?.id ?? null);
            }}
            open={trayOpen}
            triggerId={trayTrigger}
          >
            {({ payload: axis }) => (
              <Popover.Portal>
                {/* Anchored to the whole dock, not the pressed button, so the tray reads as the dock opening upward. */}
                <Popover.Positioner
                  align="center"
                  anchor={dockRef}
                  className="z-[39]"
                  collisionPadding={8}
                  positionMethod="fixed"
                  side="top"
                  sideOffset={8}
                >
                  <Popover.Popup
                    className={`${DOCK_SURFACE} ${TRAY_MOTION} w-(--anchor-width) rounded-[1.25rem] p-1.5 outline-none`}
                  >
                    {axis !== undefined && (
                      <>
                        <Popover.Title className="sr-only">{AXIS_TITLE[axis]}</Popover.Title>
                        {axis === "looks" && (
                          <Options
                            axis={axis}
                            columns="grid-cols-4"
                            onValueChange={(next) => {
                              const picked = looks.find((option) => option.value === next);
                              if (picked) apply({ theme: picked.theme, baseColor: picked.baseColor, radius: picked.radius });
                            }}
                            value={look?.value ?? ""}
                          >
                            {looks.map((option) => {
                              const optionBase = baseOptions.find((item) => item.value === option.baseColor);
                              const optionTheme = themeOptions.find((item) => item.value === option.theme);
                              const optionRadius = radiusOptions.find((item) => item.value === option.radius);
                              return (
                                <Radio.Root className={OPTION} key={option.value} value={option.value}>
                                  {/* A thumbnail of the combination: the theme's button on the base's surface, cornered by the radius. */}
                                  <span
                                    aria-hidden="true"
                                    className={`${RIM} flex h-7 w-11 shrink-0 flex-col justify-between p-1`}
                                    style={{
                                      background: optionBase?.swatch,
                                      borderRadius: `calc(${optionRadius?.glyph} * 1.4)`,
                                    }}
                                  >
                                    <span className="h-0.5 w-4 rounded-full opacity-40" style={{ background: optionBase?.ink }} />
                                    <span
                                      className="h-2 w-6 self-end"
                                      style={{ background: optionTheme?.swatch, borderRadius: `calc(${optionRadius?.glyph} * 0.6)` }}
                                    />
                                  </span>
                                  <span className="max-w-full truncate">{option.label}</span>
                                </Radio.Root>
                              );
                            })}
                          </Options>
                        )}
                        {axis === "theme" && (
                          <Options
                            axis={axis}
                            columns="grid-cols-4 sm:grid-cols-8"
                            onValueChange={(next) => select("theme", next)}
                            value={current.theme}
                          >
                            {themeOptions.map((option) => (
                              <Radio.Root className={OPTION} key={option.value} value={option.value}>
                                <ThemeGlyph className="size-6" swatch={option.swatch} value={option.value} />
                                <span className="max-w-full truncate">{option.label}</span>
                              </Radio.Root>
                            ))}
                          </Options>
                        )}
                        {axis === "baseColor" && (
                          <Options
                            axis={axis}
                            columns="grid-cols-5"
                            onValueChange={(next) => select("baseColor", next)}
                            value={current.baseColor}
                          >
                            {baseOptions.map((option) => (
                              <Radio.Root className={OPTION} key={option.value} value={option.value}>
                                <BaseGlyph className="h-6 w-8 text-[10px]" ink={option.ink} swatch={option.swatch} />
                                <span className="max-w-full truncate">{option.label}</span>
                              </Radio.Root>
                            ))}
                          </Options>
                        )}
                        {axis === "radius" && (
                          <Options
                            axis={axis}
                            columns="grid-cols-4"
                            onValueChange={(next) => select("radius", next)}
                            value={current.radius}
                          >
                            {radiusOptions.map((option) => (
                              <Radio.Root className={OPTION} key={option.value} value={option.value}>
                                <span aria-hidden="true" className="flex size-6 items-center justify-center">
                                  <RadiusGlyph className="size-5" glyph={option.glyph} />
                                </span>
                                <span className="max-w-full truncate">{option.label}</span>
                              </Radio.Root>
                            ))}
                          </Options>
                        )}
                      </>
                    )}
                  </Popover.Popup>
                </Popover.Positioner>
              </Popover.Portal>
            )}
          </Popover.Root>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
