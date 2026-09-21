"use client";

import { SearchIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

// `ssr: false` is not a performance hint here, it is a correctness
// requirement — see `command-dialog.tsx`'s header for §17.2's gate, which
// asserts the palette's chrome is absent from all 109 routes' server-rendered
// HTML and asserts this trigger's `Search` / `⌘K` are present on every one of
// them. Pairing that with the `everOpened` gate below means the palette's
// chunk is not even requested until the reader first opens it (§11.4).
const SearchCommandDialog = dynamic(() => import("./command-dialog"), { ssr: false });

// The trigger's visible label and its `aria-label`, both `search.button`
// from `i18n-ui.ts`. Production set both from the same string too.
const STRING_SEARCH = "Search";

// The glyph rendered on the server, and the one Apple platforms keep. The
// swap is a mount effect, never a render-time branch — see `isApplePlatform`.
const DEFAULT_SHORTCUT = "⌘K";
const CONTROL_SHORTCUT = "Ctrl K";

/**
 * The always-mounted half of the search palette: the header pill, the `open`
 * state, and the document-level keyboard bindings (§9.5).
 *
 * **The listener lives here and not in the dialog**, which is the whole
 * reason this file exists separately from `command-dialog.tsx`. `⌘K` has to
 * work on a page where the palette has never been opened — that is the
 * binding's entire purpose — and at that moment the dialog's chunk has not
 * been fetched, so nothing inside it can be listening. Production reached
 * the same arrangement from the other direction: its listener was attached
 * at the document from the always-present custom element, with the recorded
 * reason that an orphaned copy left behind by a client-router swap would
 * keep toggling a dialog no longer in the document. There are no
 * client-router swaps any more and this header never unmounts, so the
 * cleanup is now merely correct rather than load-bearing — but the listener
 * still belongs to the piece that is always there.
 */
export function SearchTrigger() {
  const [open, setOpen] = useState(false);
  // Latched on the first open and never cleared: closing the palette must
  // not throw away a 136 KiB index and a parsed corpus that reopening would
  // immediately want back.
  const [everOpened, setEverOpened] = useState(false);
  const [shortcut, setShortcut] = useState(DEFAULT_SHORTCUT);

  const openPalette = useCallback(() => {
    setEverOpened(true);
    setOpen(true);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        (event.key === "k" || event.key === "K") &&
        (event.metaKey || event.ctrlKey) &&
        !event.shiftKey &&
        !event.altKey
      ) {
        // The shift/alt guard is production's, and it is not paranoia:
        // Ctrl+Shift+K opens Firefox's web console. A shifted or alted chord
        // belongs to the browser, not to us.
        event.preventDefault();
        // A TOGGLE, deliberately, not an open-only binding. Production's
        // reason was mechanical — calling `showModal()` on an already-open
        // native `<dialog>` throws — and Base UI's Dialog has no such
        // constraint, but the behaviour is the one readers have; ⌘K twice
        // returns them to the page.
        setEverOpened(true);
        setOpen((previous) => !previous);
      } else if (event.key === "/" && !isField(event.target)) {
        // `/` is open-only, and inert while focus is in a field. The field
        // guard is what makes typing a literal `/` possible anywhere —
        // including inside the palette's own search input, where re-opening
        // an open dialog instead of inserting the character would make the
        // query unwritable.
        event.preventDefault();
        openPalette();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openPalette]);

  // The `⌘K` → `Ctrl K` swap, after mount and only after mount. Production
  // rewrote the same text with a script for the same reason, but here there
  // is a second one on top: the server has no platform to read, so branching
  // on it during render would be a hydration mismatch — and it would also
  // put `Ctrl K` into the prerendered HTML of every route, where §17.2's gate
  // asserts `⌘K`.
  useEffect(() => {
    if (!isApplePlatform()) setShortcut(CONTROL_SHORTCUT);
  }, []);

  return (
    <>
      {/*
        Classes ported from Search.astro:79-91, plus the `shrink-0` that
        production had to inject from the outside. It lived in a
        `<style is:global>` block in `Header.astro` because the trigger
        arrived through a Blume layout slot whose classes were not ours to
        edit; the recorded symptom was that the button and its 16px icon both
        compressed once the header ran out of room, leaving a bordered circle
        with a dot in it. Everything else in this header is already rigid, so
        the rule is reinstated here — where the classes finally are ours —
        rather than as a global selector reaching in.

        The label and the shortcut wait until `lg`: below it the hamburger
        and the inline tab bar share the header row. That is CSS, so the
        strings are still in the server-rendered HTML at every width, which
        is exactly what §17.2's `Search⌘K` assertion reads.
      */}
      <button
        aria-label={STRING_SEARCH}
        className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-3 text-muted-foreground text-sm transition-colors hover:border-foreground hover:text-foreground lg:min-w-40"
        onClick={openPalette}
        type="button"
      >
        <SearchIcon aria-hidden="true" className="shrink-0" size={16} />
        {/*
          `grow shrink-0 basis-0` rather than `flex-1`, which is the same
          computed `flex: 1 0 0%` production ended up with once its global
          rule zeroing the shrink factor overrode `flex-1`'s own. Spelled as
          three longhands so the result does not depend on which order
          Tailwind happens to emit the shorthand and longhand utilities in.
        */}
        <span className="grow shrink-0 basis-0 text-start max-lg:hidden">{STRING_SEARCH}</span>
        <kbd className="shrink-0 font-mono text-[0.7rem] max-lg:hidden">{shortcut}</kbd>
      </button>
      {everOpened && <SearchCommandDialog onOpenChange={setOpen} open={open} />}
    </>
  );
}


/**
 * `INPUT` / `TEXTAREA` / `contenteditable`, exactly as production's `isField`
 * defined it (Search.astro:446-455). Anything the reader can type into is a
 * place where `/` means a slash.
 */
function isField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
}

/**
 * `navigator.platform` is deprecated, and it is still the right read here.
 * The supported replacement, `navigator.userAgentData.platform`, does not
 * exist in Safari or Firefox — the two browsers where guessing wrong is most
 * visible, since one of them is the Apple case this test exists to detect.
 * Production used the same regex; a wrong answer costs a label, not a
 * binding, because the binding itself already accepts both modifiers.
 */
function isApplePlatform(): boolean {
  return /mac|iphone|ipad|ipod/iu.test(navigator.platform);
}
