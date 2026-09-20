"use client";

import { Check, ChevronDown, Copy } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  DEFAULT_PACKAGE_MANAGER,
  PACKAGE_MANAGERS,
  PACKAGE_MANAGER_KEY,
  currentPackageManager,
  packageManagerCommands,
  type PackageManager,
} from "../../lib/package-manager";
import { installCommand } from "../../lib/registry";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/registry/base/ui/tooltip";
import { useAnnounce } from "./blocks-announcer";

/**
 * The install command as ONE fused 32px unit: a package-manager menu button,
 * the command's tail, and a copy button, separated by hairlines rather than
 * gaps so the three read as a single object at the toolbar's own height.
 * Ported class-for-class from `legacy-components/install-control.astro`.
 * §6.1's table lists the /blocks package-manager control as UNCHANGED, so
 * this deliberately does NOT become `components/package-manager-menu.tsx` —
 * that is the docs' shape (a registry dropdown in a code-block header band)
 * and a different control.
 *
 * Only the PM label varies with the preference; the visible command text does
 * NOT. The runner prefix (`npx` / `pnpm dlx` / `yarn dlx` / `bunx --bun`) plus
 * `shadcn@latest` is exactly the part the label already tells you, so eliding
 * it to a leading "…" keeps the identifying half — the registry item —
 * readable at every width, and keeps the text stable when the preference
 * changes.
 *
 * WHICH command is on screen is decided by CSS off `[data-pm]` on `<html>`,
 * written pre-paint by `components/package-manager-script.tsx` and revealed
 * by the unlayered `.pm-only` / `.pm-only-{pm}` rules in `app/globals.css`
 * (including the `:root:not([data-pm]) .pm-only-pnpm` pre-script default).
 * That mechanism is Stage 1/2 work on a verified surface and is NOT rebuilt
 * here; all four commands ship in the markup and exactly one is revealed, so
 * six cards stay in agreement with no per-card rendering at all.
 *
 * A CLIENT component, where the plan's file list said "server". In Astro the
 * markup was server-rendered and every handler lived in `block-frame.astro`'s
 * one delegated document listener — a workaround for the cost of an island
 * per button, which React does not have. A component that owns a menu, a
 * roving tab order and a copy button is interactive by definition, so
 * splitting it back into inert markup plus a delegated handler would be
 * copying a workaround for a constraint that no longer exists.
 * `installCommand()` (`lib/registry.ts`) is a pure string builder with no
 * `server-only` marker, so it can be called from right here and the props
 * stay exactly what the Astro source took.
 *
 * THREE LOAD-BEARING DETAILS, each with its own note at the markup below:
 * the `dir="rtl"` + `<bdi>` start-truncation, the four full commands riding
 * along so the copy handler can pick one by the LIVE preference, and the
 * copy button's constant accessible name.
 *
 * CROSS-CARD STALENESS, and the precedent that solves it. A category page
 * renders one of these per card, each with its own `checked` state, and
 * `storage` events do not fire in the document that made the change — so a
 * choice made in card 3 would leave cards 1, 2 and 4-6 with a stale tick in
 * their menus. The visible half is immune (CSS, off one shared attribute),
 * and `components/package-manager-menu.tsx` already solved the invisible
 * half the same way this does: the preference is read fresh from
 * `currentPackageManager()` at the moment a popup is about to open, never
 * held across a period where it could go stale. `null` until then, which is
 * also what makes the server-rendered markup — four unticked options, all
 * outside the tab order — match what Astro shipped.
 */

const KEY =
  "relative inline-flex cursor-pointer items-center text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:z-[1] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring";

const COPIED_MS = 1600;

export interface InstallControlProps {
  /** Registry item path passed to `installCommand()`, e.g. "pro/dashboard-01". */
  item: string;
  /** Block title, used only to make the copy announcement specific. */
  title: string;
}

export function InstallControl({ item, title }: InstallControlProps) {
  const announce = useAnnounce();
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<PackageManager | null>(null);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commands = useMemo(
    () => packageManagerCommands((pm) => installCommand(item, pm)),
    [item],
  );
  // Derived from a real command rather than re-assembled, so it stays correct
  // if installCommand's shape changes (namespace vs. direct registry URL).
  const tail = `… ${commands.npm.replace(/^.*?shadcn@latest\s+/, "")}`;

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  // Read the live preference ONCE on mount, not only as a popup opens. The
  // copy tooltip renders a full command, and with `checked` still null it had
  // to fall back to DEFAULT_PACKAGE_MANAGER — so a bun reader could be shown
  // the pnpm command for the frame between the popup opening and the
  // `onOpenChange` read landing. That is precisely the failure the four
  // `.pm-only` spans exist to prevent (never the wrong manager, not even for
  // one frame), so the tooltip must not be the one place that does it. This
  // runs after hydration, which is what keeps the server markup — four
  // unticked options, all outside the tab order — matching what Astro shipped.
  // The on-open reads below stay: they are what keeps six cards in agreement
  // after one of them writes the preference.
  useEffect(() => setChecked(currentPackageManager()), []);

  // Non-modal, like the theme dock's panel: no scrim, no focus trap. Escape
  // and an outside pointerdown close it — and because every card's control
  // does this, pressing another card's trigger closes this one first
  // (pointerdown precedes click), which is what the Astro script's
  // `closeAllMenus(except)` did across the page.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && rootRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Opening moves focus onto the ticked option, matching the source's
  // `menu.querySelector('[aria-checked="true"]')?.focus()`.
  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    menu?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
  }, [open, checked]);

  function selectPm(pm: PackageManager) {
    try {
      localStorage.setItem(PACKAGE_MANAGER_KEY, pm);
    } catch {
      // Storage blocked; the choice still applies for this page view.
    }
    // The one shared attribute every other reader consults — the CSS that
    // reveals a command, this control's own copy handler, and every other
    // card's control.
    document.documentElement.dataset.pm = pm;
    setChecked(pm);
    setOpen(false);
    triggerRef.current?.focus();
  }

  async function copy() {
    // The LIVE preference, not `checked`: the attribute is what the CSS keys
    // off, so the button can never copy a command other than the one on
    // screen.
    const pm = currentPackageManager();
    try {
      await navigator.clipboard.writeText(commands[pm]);
      announce(`Copied the ${pm} install command for ${title}.`);
    } catch {
      // Clipboard unavailable (permissions/insecure context); nothing to undo.
      announce("Copy failed — the clipboard is unavailable.");
      return;
    }
    setCopied(true);
    // Re-copying before the confirmation ends restarts it rather than letting
    // the first timer cut the second one short.
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), COPIED_MS);
  }

  function onOptionKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    const options = menuRef.current?.querySelectorAll<HTMLElement>("[data-pm-option]");
    if (!options) return;
    const focus = (next: number) => {
      event.preventDefault();
      options[(next + options.length) % options.length]?.focus();
    };
    if (event.key === "ArrowDown") return focus(index + 1);
    if (event.key === "ArrowUp") return focus(index - 1);
    if (event.key === "Home") return focus(0);
    if (event.key === "End") return focus(options.length - 1);
  }

  return (
    <div
      className="relative flex h-8 min-w-0 shrink items-stretch rounded-md border border-border bg-background text-xs"
      ref={rootRef}
    >
      {/* The only toolbar control that carried no hint at all. The accessible
          name still comes from the sr-only span plus the visible brand name,
          so the tooltip stays decorative. */}
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              aria-expanded={open}
              aria-haspopup="menu"
              className={`${KEY} gap-1 rounded-s-md px-2 font-medium text-foreground`}
              onClick={() => {
                // Read the live attribute exactly as the popup is about to
                // render, never before.
                if (!open) setChecked(currentPackageManager());
                setOpen((value) => !value);
              }}
              ref={triggerRef}
              type="button"
            >
              <span className="sr-only">Package manager:</span>
              {/* Mark and name are both `.pm-only`, so the same CSS that picks
                  the command picks the brand — the trigger never needs a
                  render pass to stay truthful. The marks come from the page's
                  one sprite (`package-manager-icons.tsx`); `aria-hidden`
                  because the name beside them already says which is which. */}
              {PACKAGE_MANAGERS.map((pm) => (
                <svg aria-hidden="true" className={`pm-only pm-only-${pm} size-3.5 shrink-0`} key={pm}>
                  <use href={`#pm-icon-${pm}`} />
                </svg>
              ))}
              {PACKAGE_MANAGERS.map((pm) => (
                <span className={`pm-only pm-only-${pm}`} key={pm}>
                  {pm}
                </span>
              ))}
              <ChevronDown aria-hidden="true" className="size-3 shrink-0 text-muted-foreground" strokeWidth={1.5} />
            </button>
          }
        />
        <TooltipContent>Change package manager</TooltipContent>
      </Tooltip>

      <span aria-hidden="true" className="w-px shrink-0 bg-border" />

      {/* Not a control — the readable half of what the copy button will put on
          the clipboard. Two details that look fussy and are not:

          The truncation lives on the inner span, never on this flex parent.
          `text-overflow` acts on a block box's own inline content, and a bare
          text node inside a flex box is an anonymous flex ITEM — so putting
          the ellipsis utility here produced a hard clip with no ellipsis at
          all.

          That span truncates from the START (`dir="rtl"`, with the command in
          a <bdi> so the Latin text itself is not reordered). This is the one
          surviving `dir="rtl"` on the site: a typographic trick, not a locale.
          The head is the part we already chose to elide — the runner and
          `shadcn@latest`, which the package-manager label beside this already
          names — while the tail is the registry item, the only part that
          distinguishes dashboard-01 from dashboard-02. Truncating the usual
          way cut off exactly that. When the CSS ellipsis does appear it simply
          swallows the authored one, so there is never a double. */}
      <code className="flex min-w-0 flex-1 items-center px-2 font-mono text-muted-foreground">
        <span className="block min-w-0 flex-1 truncate text-left" dir="rtl">
          <bdi>{tail}</bdi>
        </span>
      </code>

      <span aria-hidden="true" className="w-px shrink-0 bg-border" />

      {/* The two icons swap by toggling a display utility on each, rather than
          through a group-data variant — the accessible name stays constant
          ("Copy install command"), because swapping it to "Copied" destroys
          the button's name for anyone who tabs back to it later, and the
          result is announced through the page's live region instead. The
          tooltip carries the full command for the LIVE preference; it flashes
          "Copied" for the same duration as the icon, which is the sighted half
          of the same confirmation. That flash only renders because of
          `closeOnClick={false}`: Base UI's TooltipTrigger defaults it to
          `true` and wires it to `useDismiss({ referencePress })`, so the very
          click that copies would otherwise dismiss the popup the confirmation
          is written into. */}
      <Tooltip
        onOpenChange={(isOpen) => {
          if (isOpen) setChecked(currentPackageManager());
        }}
      >
        <TooltipTrigger
          closeOnClick={false}
          render={
            <button
              className={`${KEY} w-8 shrink-0 justify-center rounded-e-md`}
              onClick={() => void copy()}
              type="button"
            >
              <span className="sr-only">Copy install command</span>
              <Copy aria-hidden="true" className={copied ? "hidden size-4" : "size-4"} strokeWidth={1.5} />
              <Check aria-hidden="true" className={copied ? "size-4" : "hidden size-4"} strokeWidth={1.5} />
            </button>
          }
        />
        {/* The fallback is unreachable after the mount effect above — it is
            here because `checked` is typed nullable for the server render,
            where no tooltip can be open. */}
        <TooltipContent>{copied ? "Copied" : commands[checked ?? DEFAULT_PACKAGE_MANAGER]}</TooltipContent>
      </Tooltip>

      {/* Anchored under the TRIGGER (left), not the control's right edge. */}
      <div
        aria-label="Package manager"
        className="absolute top-full left-0 z-30 mt-1 min-w-[7rem] rounded-md border border-border bg-card p-1 shadow-[0_10px_24px_-6px_rgb(0_0_0/0.18),0_2px_6px_-2px_rgb(0_0_0/0.10)]"
        hidden={!open}
        ref={menuRef}
        role="menu"
      >
        {PACKAGE_MANAGERS.map((pm, index) => (
          <button
            aria-checked={checked === pm}
            className="group/opt flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left font-mono text-xs text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground aria-checked:font-medium aria-checked:text-foreground"
            data-pm-option={pm}
            key={pm}
            onClick={() => selectPm(pm)}
            onKeyDown={(event) => onOptionKeyDown(event, index)}
            role="menuitemradio"
            tabIndex={checked === pm ? 0 : -1}
            type="button"
          >
            <svg aria-hidden="true" className="size-3.5 shrink-0">
              <use href={`#pm-icon-${pm}`} />
            </svg>
            {pm}
            {/* The tick trails the name rather than leading it, so the four
                brand marks form one column the eye can scan. */}
            <Check
              aria-hidden="true"
              className="ml-auto size-3 shrink-0 opacity-0 group-aria-checked/opt:opacity-100"
              strokeWidth={2}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
