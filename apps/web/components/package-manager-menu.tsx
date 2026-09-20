"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";
import {
  DEFAULT_PACKAGE_MANAGER,
  PACKAGE_MANAGER_KEY,
  PACKAGE_MANAGERS,
  currentPackageManager,
  isPackageManager,
  readPackageManager,
  type PackageManager,
} from "../lib/package-manager";

function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

// Task 2.7, §6.1/§17.6 #7 — "the menu is the one interactive part." Every
// docs install block gets one of these in its header band
// (components/mdx/install-command.tsx passes it as CodeBlock's
// `headerRight`). It does NOT re-render the four install commands — those
// already all sit in the DOM and CSS (globals.css's `.pm-only` rules)
// reveals one off `[data-pm]`. This component's only two jobs are (a) show
// the current preference truthfully and (b) let the reader change it.
//
// (a) is why the trigger's own visible label is FOUR `.pm-only` spans, one
// per package manager, not a React-rendered string — reproduced verbatim
// from legacy-components/install-control.astro's own trigger. CSS decides
// which one is visible at first paint (pre-hydration, off the same
// `data-pm` attribute <PackageManagerScript> — Stage 1 — already writes
// before paint), so the label is never wrong, not even for one frame.
// Driving it from React state instead would show the WRONG manager until
// that state syncs.
//
// (b) is the one piece of real interactivity: selecting an item writes
// `localStorage[PACKAGE_MANAGER_KEY]` and sets `document.documentElement
// .dataset.pm`, which is all CSS needs to re-reveal a different variant —
// no re-render of any install block anywhere on the page. A `storage`
// listener mirrors the same write when another tab changes the preference,
// matching legacy-components/block-frame.astro's `syncInstallControls()`
// (that file also keeps a second tab's UI in sync, just via direct DOM
// writes instead of React state).
//
// Built on the registry's own Base UI menu (@/registry/base/ui/dropdown-
// menu — the `@/*` alias resolves to packages/registry, the same import
// shape components/landing-showcase.tsx already uses), radio-group flavour:
// exactly one of four items is ever checked, which is what
// `legacy-components/install-control.astro`'s `role="menuitemradio"` items
// meant natively — Base UI's `MenuRadioGroup`/`MenuRadioItem` is the closed
// -form equivalent rather than four plain `MenuItem`s with hand-rolled
// checked state.
//
// SHARED SURFACE, but only this piece of it (fix round 1, task-2.7 review
// MINOR 2): this component and `currentPackageManager()`
// (lib/package-manager.ts) are what §6.1's table means by the three install
// surfaces "agreeing" — each surface keeps its OWN shape (this fused menu
// for docs; `/blocks`' cramped 32px control; Stage 4's `copy-command.tsx`,
// which "keeps its shape" per §13.2 — its `$ command` row — while taking a
// `Record<PackageManager, string>` of its own, NOT `CodeBlock`'s
// `installCommands` record. (Task 4.1 correction: this comment used to read
// "and takes `command: string`". §13.2's actual sentence is "keeps its shape
// but takes its command from the same four-command set", so the string form
// was a misreading; what stays unshared is the PROP below, not the four-
// command data.) `CodeBlock`'s `installCommands` prop is NOT
// part of that shared surface — it has exactly one consumer,
// `components/mdx/install-command.tsx`, today. Do not wire a future gallery
// or `/blocks` port through `CodeBlock`; reuse this component and
// `currentPackageManager()` instead, the same way this file already does.
//
// No brand marks (pnpm/npm/yarn/bun logos): the source sprite
// (legacy-components/package-manager-icons.astro, `<use href="#pm-icon-*">`)
// exists only in the Astro half and has no Next.js equivalent yet. Inlining
// four new brand SVGs is explicitly not required for this task — Stage 5
// (which ports `/blocks`, the other consumer of that sprite) owns the
// shared icon story. This menu is plain-text-only until then.
export function PackageManagerMenu() {
  // Fix round 1 (task-2.7 review IMPORTANT 1): this used to be seeded once
  // at mount and updated only by this instance's own `selectPm` or a
  // `storage` event — but `storage` never fires in the document that
  // performed the write, so a second `<PackageManagerMenu>` on the same
  // page (docs/installation.mdx has two) never learned about a change made
  // through the first one, leaving its popup's checkmark on the wrong item
  // while its own trigger label, driven by CSS off the SAME `data-pm`
  // attribute, correctly showed the new one.
  //
  // `[data-pm]` is already the single source of truth every other reader
  // (CSS, the copy button, the pre-paint script) consults live, so this
  // state is now populated ONLY right as the popup is about to open
  // (`onOpenChange`, below) — read fresh every time, never held across a
  // period where it could go stale. The `DEFAULT_PACKAGE_MANAGER` initial
  // value below is never visibly wrong: the popup does not render at all
  // until open (confirmed empirically — task-2.7-report.md), so nothing
  // ever displays this placeholder.
  const [checkedValue, setCheckedValue] = React.useState<PackageManager>(DEFAULT_PACKAGE_MANAGER);

  React.useEffect(() => {
    function onStorage(event: StorageEvent): void {
      // A `storage` event's `key` is `null` for `localStorage.clear()`;
      // treat that as "re-read," same as any key we don't recognise being
      // absent. Ignore every OTHER app's key.
      if (event.key !== null && event.key !== PACKAGE_MANAGER_KEY) return;
      // This write is the real, still-necessary job of this listener: a
      // change made in ANOTHER tab only reaches this tab's localStorage,
      // not this document's `data-pm` attribute — without this, this
      // document's CSS would keep revealing the old variant forever.
      const next = readPackageManager(localStorage);
      document.documentElement.dataset.pm = next;
      // Also refresh the popup's own checked state, in case it happens to
      // be open while another tab writes.
      setCheckedValue(next);
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function selectPm(pm: PackageManager): void {
    setCheckedValue(pm);
    document.documentElement.dataset.pm = pm;
    try {
      localStorage.setItem(PACKAGE_MANAGER_KEY, pm);
    } catch {
      // Storage blocked (private mode, disabled cookies, …); the choice
      // still applies for this page view via the dataset write above.
    }
  }

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        // Read the live attribute exactly as the popup is about to render,
        // never before — this is what makes a second instance's stale
        // state unrepresentable rather than merely resynchronised.
        if (open) setCheckedValue(currentPackageManager());
      }}
    >
      <DropdownMenuTrigger
        className={cx(
          "inline-flex cursor-pointer items-center gap-1 rounded-sm px-1.5 py-1 font-mono text-xs font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:bg-muted",
        )}
      >
        <span className="sr-only">Package manager:</span>
        {PACKAGE_MANAGERS.map((pm) => (
          <span key={pm} className={`pm-only pm-only-${pm}`}>
            {pm}
          </span>
        ))}
        <ChevronDownIcon aria-hidden="true" className="size-3 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={checkedValue}
          onValueChange={(next) => {
            // Fix round 1 (task-2.7 review MINOR 1): Base UI types `next`
            // as `any` — `selectPm` is the only writer of `dataset.pm` /
            // `localStorage[PACKAGE_MANAGER_KEY]` in the app, and an
            // unvalidated write is the one value that renders NOTHING (an
            // invalid `data-pm` matches neither `:root:not([data-pm])` nor
            // any `[data-pm="…"]` in globals.css). The four items below are
            // literally `PACKAGE_MANAGERS` today, so this can't actually
            // fire false — the guard is for whatever this menu's `value`
            // union looks like next, not today's four literals.
            if (isPackageManager(next)) selectPm(next);
          }}
        >
          {PACKAGE_MANAGERS.map((pm) => (
            <DropdownMenuRadioItem key={pm} value={pm} className="font-mono text-xs">
              {pm}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
