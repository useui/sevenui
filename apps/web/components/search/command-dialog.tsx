"use client";

import { Autocomplete } from "@base-ui/react/autocomplete";
import { FileIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/registry/base/ui/command";
import {
  POPULAR,
  SEARCH_INDEX_URL,
  SEARCH_RESULT_LIMIT,
  type SearchEntry,
} from "../../lib/docs/search";
import {
  countSections,
  normalizeQuery,
  prepareEntries,
  rankEntries,
  type HighlightSegment,
  type PreparedEntry,
  type SearchHit,
} from "./scorer";

/**
 * The docs search palette (§9.3, §9.7). Rendered by `search-trigger.tsx`
 * behind `next/dynamic`, and only once the reader has opened the palette at
 * least once, which is what keeps this module — and the matcher, and the
 * 136 KiB index it fetches — out of the header's chunk (§11.4).
 *
 * **This component's markup must never reach the server-rendered HTML.**
 * §17.2's differential gate extracts visible text from all 109 routes and
 * compares it to production's. Production server-renders its whole closed
 * `<dialog>` into every page, so its extracted text carries the dialog's
 * chrome; the gate strips that run from production's side as a declared
 * owned difference and then ASSERTS the run is absent from ours. A stray
 * `ssr: true` on the dynamic import, or hoisting this into the header
 * unconditionally, fails the gate on every route at once. The trigger is the
 * opposite case — `Search` and `⌘K` are asserted PRESENT on both sides — so
 * the split between the two files is load-bearing, not organisational.
 *
 * Built on the registry's own `command` primitive, which is
 * `Autocomplete.Root`: combobox roles, `aria-activedescendant`, the
 * highlight, arrow-key navigation and the focus trap all come from the
 * primitive instead of the 866-line custom element this replaces. The one
 * piece that is NOT the primitive's is the matcher — see `scorer.ts` for why
 * Base UI's own `Intl.Collator` substring filter could not rank this corpus —
 * which is handed in through `filteredItems`. Verified against the installed
 * `@base-ui/react@1.7.0`: `AriaCombobox.Props` declares
 * `filteredItems?: readonly any[] | readonly Group<any>[]` ("when provided,
 * the list will use these items instead of filtering the `items` prop
 * internally") and `AutocompleteRootProps`'s `Omit<…>` list does not strip
 * it, so it survives the registry's `{...props}` spread onto `Root`.
 */

// The eight strings that survive from `blume/src/core/i18n-ui.ts`'s search
// defaults (no overrides were ever configured, and there are no locales, so
// the whole i18n merge is gone with them). `askAi`, `askAiHint`, `devOnly`,
// `allLanguages`, `allVersions` and `preview` are not here: each names a
// feature this deployment does not have.
//
// `error` IS here, against the parity reference's list, which files it under
// "not ported (dead in this deployment)". That classification was right
// about Blume and wrong about us: Blume's `error` covered a hosted search
// PROVIDER rejecting a query, and no provider is configured, so in a static
// build that path could not be reached. Ours is a different path — this
// palette fetches a static asset over the network on first open, and a
// network fetch can fail — so the state is live even though the string's
// old cause is gone.
//
// The alternative was to render a failed fetch as `No results found.`,
// which tells the reader the docs do not contain what they searched for: a
// WRONG answer rather than an unavailable one. This migration has already
// made that call once, on /account's retry (§17.6 #43), and it is the same
// call.
const STRINGS = {
  label: "Search docs",
  placeholder: "Search documentation…",
  popular: "Popular",
  results: "Results",
  noResults: "No results found.",
  all: "All",
  navigate: "navigate",
  open: "open",
  // Shown while the first-open fetch is still in flight. A neutral marker
  // rather than a message, exactly as production did it: at this point we do
  // not yet know whether the query has results, and either real answer would
  // be a guess.
  loading: "…",
  error: "Something went wrong. Please try again.",
} as const;

// Ported from Search.astro's own class constants. The transparent border on
// every row is deliberate: highlighting a row only recolors that border, so
// moving the cursor down the list cannot shift the layout by 1px.
const ROW_CLASS =
  "w-full cursor-pointer items-start gap-2.5 border border-transparent px-2.5 py-2 text-start text-inherit transition-colors hover:no-underline data-highlighted:border-border [&_mark]:rounded-sm [&_mark]:bg-accent/25 [&_mark]:text-inherit";

const PILL_BASE =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium text-xs transition-colors";
const PILL_ON = "border-transparent bg-foreground text-background";
const PILL_OFF = "border-border text-muted-foreground hover:text-foreground";

const KBD_CLASS = "rounded border border-border bg-muted px-1 py-0.5 font-mono";

// Production's dialog is `w-[min(62.5rem,94vw)]` in Blume's source and then
// forced to `min(40rem,94vw)` by `theme.css`, which also collapses the
// two-column grid and hides the result-preview pane — three `!important`
// rules fighting a component to make it a single-column palette. §9 calls
// that out as the reason this surface is a forced redesign rather than a
// port: the replacement simply IS the single column, so the overrides have
// nothing left to override. The measurements are production's final,
// overridden ones.
//
// Every class here lands on a `cn` (clsx + tailwind-merge) call in
// `DialogContent` with this string LAST, so each one displaces its
// counterpart from the primitive's own list rather than racing it in source
// order: `flex` displaces `grid`, `max-w-none` displaces both
// `max-w-[calc(100%-2rem)]` and `sm:max-w-sm`, `ring-0` displaces the
// primitive's hairline ring in favour of production's real border.
const DIALOG_CLASS =
  "top-[8vh] flex h-[min(480px,90dvh)] w-[min(40rem,94vw)] max-w-none translate-y-0 flex-col gap-0 border border-border bg-background/80 text-foreground shadow-2xl ring-0 backdrop-blur-xl sm:top-1/2 sm:max-w-none sm:-translate-y-1/2";

type LoadStatus = "idle" | "loading" | "ready" | "error";

/**
 * A row in the list. Two kinds share one template (§9.7): a popular link is
 * an icon and a title, a hit adds the second line. Neither carries a `label`
 * or a `value` key — Base UI reads exactly those two names off item objects
 * to derive a display string, and this list's rows are never displayed in
 * the input, so giving it something to find there would only invite it to
 * use it.
 */
type PaletteRow =
  | { readonly kind: "popular"; readonly key: string; readonly href: string; readonly text: string }
  | { readonly kind: "hit"; readonly key: string; readonly href: string; readonly hit: SearchHit };

type PaletteGroup = {
  readonly key: string;
  readonly label: string;
  readonly items: readonly PaletteRow[];
};

export default function SearchCommandDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [entries, setEntries] = useState<PreparedEntry[] | null>(null);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mirrors `status` for the load effect below, which must NOT list `status`
  // in its dependencies — see the comment there.
  const statusRef = useRef<LoadStatus>("idle");

  // The house mount flag (`components/account/account-panel.tsx:106-118`),
  // re-armed in the setup body rather than written only by the cleanup. App
  // Router runs under `<StrictMode>` in development (Next 16 defaults
  // `reactStrictMode` on and `next.config.ts` does not override it), which
  // mounts every effect, runs its cleanup, and mounts it again. A ref
  // survives that simulated unmount, so a flag whose only writer is the
  // cleanup would read `false` for the rest of a fully-mounted component's
  // life. This one ends every StrictMode cycle at `true`, matching whichever
  // pass is actually live.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // The index is fetched on first open and never on page load — §9.2's
  // whole point, and the reason `SEARCH_INDEX_URL` is a plain string
  // constant rather than an import of the 136 KiB asset.
  //
  // The dependency array is `[open]` and not `[open, status]` on purpose.
  // Reading `status` through a ref means the effect fires only on an
  // open/close transition, which reproduces production's failure policy
  // exactly: a successful load latches, a failed one does not, so a flaky
  // network retries on the NEXT open instead of disabling search until a
  // reload. With `status` in the array the effect would re-fire the moment
  // it set `"error"`, and a persistent failure would become an unbounded
  // refetch loop against an asset that is already failing.
  //
  // **The invariant, and the bug it replaces (Controller Ruling — round
  // 1/5): no path out of this effect leaves `statusRef.current` at
  // `"loading"`.** The first version cancelled the load from the effect's
  // cleanup, which fires on every `open: true -> false` transition and not
  // only on unmount — so closing the palette while the 136 KiB fetch was in
  // flight made the resolution return early WITHOUT clearing the flag it had
  // set. Every later open then hit the `"loading"` guard below, `entries`
  // stayed `null`, and every query rendered `…` until a full page reload.
  // In development it was not even a race: StrictMode's mount -> cleanup ->
  // remount ran the cancel deterministically, so search never worked at all.
  //
  // The fix is structural rather than a wider guard: **there is no
  // cancellation on close.** Nothing about closing the palette makes a
  // download that is about to finish less wanted — `everOpened` in
  // `search-trigger.tsx` exists precisely so a fetched index outlives a
  // close — so the load simply runs to completion and writes its own
  // terminal status. `statusRef.current` is assigned unconditionally below,
  // BEFORE the mount check, so the only way to leave it at `"loading"` is a
  // real unmount that takes the ref with it. `mountedRef` gates the two
  // `setState` calls and nothing else.
  useEffect(() => {
    if (!open) return;
    if (statusRef.current === "loading" || statusRef.current === "ready") return;

    statusRef.current = "loading";
    setStatus("loading");

    (async () => {
      let next: LoadStatus;
      let prepared: PreparedEntry[] | null = null;
      try {
        const response = await fetch(SEARCH_INDEX_URL);
        if (!response.ok) {
          throw new Error(`${SEARCH_INDEX_URL} responded ${response.status}`);
        }
        prepared = prepareEntries((await response.json()) as SearchEntry[]);
        next = "ready";
      } catch (error) {
        console.error("search:", error);
        next = "error";
      }
      // Unconditional, and ahead of the mount check on purpose: this
      // assignment IS the invariant above. Moving it below the guard would
      // reintroduce the exact defect it replaces.
      statusRef.current = next;
      if (!mountedRef.current) return;
      if (prepared !== null) setEntries(prepared);
      setStatus(next);
    })();
  }, [open]);

  // Closing resets the query and the section filter, whatever closed it —
  // Escape, the backdrop, ⌘K, or following a result. Uniformity is the
  // point: Base UI's combobox input clears its own value on Escape (it is
  // `inline`, so it lets the key bubble on to close the dialog rather than
  // swallowing it), so preserving the query would preserve it after three of
  // the four close paths and drop it after the fourth.
  useEffect(() => {
    if (open) return;
    setQuery("");
    setActiveSection(null);
  }, [open]);

  const normalizedQuery = normalizeQuery(query);
  const allHits = useMemo(
    () => (entries === null ? [] : rankEntries(entries, query)),
    [entries, query],
  );
  // Counted over the FULL ranked list, before the section filter and before
  // the result cap: a pill that showed "Primitives 12" because twelve is
  // where the list was truncated would be reporting on the UI, not on the
  // corpus.
  const sections = useMemo(() => countSections(allHits), [allHits]);
  const sectionStripVisible = sections.length >= 2;
  const sectionIsLive = activeSection !== null && sections.some((s) => s.label === activeSection);
  const effectiveSection = sectionIsLive ? activeSection : null;

  // The stale-filter guard (Search.astro:578-589), as a state normalisation
  // rather than production's re-entrant `render()` call. The hazard it
  // defuses: a section chosen for an earlier query can be absent from the
  // next query's pool, and the pill strip that would let the reader clear it
  // is hidden whenever the pool spans fewer than two sections — so the
  // stale filter silently empties a result set that actually has results,
  // with nothing on screen explaining why. `effectiveSection` above already
  // makes the rendered output correct on the very first pass (production
  // needed a second pass for that); this only writes the correction back so
  // the filter does not reappear if the reader types their way back to a
  // query where that section exists again, which is what production's
  // one-way drop did.
  useEffect(() => {
    if (activeSection !== null && !sectionIsLive) setActiveSection(null);
  }, [activeSection, sectionIsLive]);

  const groups = useMemo<PaletteGroup[]>(() => {
    if (normalizedQuery === "") {
      return [
        {
          key: "popular",
          label: STRINGS.popular,
          items: POPULAR.map((link) => ({
            kind: "popular" as const,
            key: link.href,
            href: link.href,
            text: link.label,
          })),
        },
      ];
    }
    if (status !== "ready") return [];
    const filtered =
      effectiveSection === null
        ? allHits
        : allHits.filter((hit) => hit.entry.section === effectiveSection);
    if (filtered.length === 0) return [];
    return [
      {
        key: "results",
        label: STRINGS.results,
        items: filtered.slice(0, SEARCH_RESULT_LIMIT).map((hit) => ({
          kind: "hit" as const,
          key: hit.href,
          href: hit.href,
          hit,
        })),
      },
    ];
  }, [allHits, effectiveSection, normalizedQuery, status]);

  // Rendered by `CommandEmpty`, which Base UI mounts unconditionally and
  // fills only when the list is empty — it is a polite live region, so
  // conditionally rendering the element itself would stop screen readers
  // announcing the transition into "no results".
  let emptyMessage = "";
  if (normalizedQuery !== "") {
    if (status === "error") emptyMessage = STRINGS.error;
    else if (status === "ready") emptyMessage = STRINGS.noResults;
    else emptyMessage = STRINGS.loading;
  }

  const selectSection = useCallback((label: string | null) => {
    setActiveSection(label);
    // Production returns focus to the input after a pill click, and here it
    // is not a nicety: focus lives on the input for the whole session
    // because that is where `aria-activedescendant` announces the highlight
    // from. Leaving focus on the pill would silently disconnect the arrow
    // keys from the list.
    inputRef.current?.focus();
  }, []);

  const handleRowClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      // A modified click is the browser's "open somewhere else" gesture, and
      // `next/link` deliberately lets it fall through to the anchor's native
      // behaviour instead of routing. Closing the palette on one would hide
      // it behind a tab the reader never switched to.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      onOpenChange(false);
    },
    [onOpenChange],
  );

  const totalPages = sections.reduce((sum, section) => sum + section.count, 0);

  return (
    <CommandDialog
      className={DIALOG_CLASS}
      description={STRINGS.placeholder}
      onOpenChange={onOpenChange}
      open={open}
      title={STRINGS.label}
    >
      <Command
        className="gap-0 bg-transparent p-0 text-foreground"
        filteredItems={groups}
        // `items` carries the same array as `filteredItems`, which is not
        // redundant: Base UI decides whether the list is FLAT or GROUPED by
        // inspecting `items` alone (`isGroupedItems` looks for an `items`
        // key on the first element). Handing it `filteredItems` only would
        // leave it reading a grouped array as a flat one, and every group
        // object — not the rows inside it — would become one list entry.
        items={groups}
        onValueChange={setQuery}
        value={query}
      >
        <div className="flex shrink-0 items-center gap-2.5 border-border border-b px-4 py-3 text-muted-foreground">
          <SearchIcon aria-hidden="true" className="shrink-0" size={18} />
          {/*
            The one place this file reaches past the registry's `Command*`
            wrappers to the primitive underneath. `CommandInput` renders a
            fixed `InputGroup` — a bordered, rounded, `h-8` field — and
            exposes no way to put anything beside it, so production's input
            row (a flush 18px glyph, a borderless field, and the `Esc` hint
            at the far end, separated from the list by a single rule) cannot
            be expressed through it. Using `Autocomplete.Input` directly
            keeps every combobox behaviour — it is the same element
            `CommandInput` renders — and gives up only the wrapper's styling,
            which is the part being replaced.
          */}
          <Autocomplete.Input
            aria-label={STRINGS.label}
            autoComplete="off"
            className="min-w-0 flex-1 border-0 bg-transparent text-foreground text-sm outline-none pointer-coarse:text-base"
            placeholder={STRINGS.placeholder}
            ref={inputRef}
          />
          <kbd className={`${KBD_CLASS} shrink-0 text-[0.7rem]`}>Esc</kbd>
        </div>

        {sectionStripVisible && (
          <div className="flex shrink-0 flex-wrap gap-1.5 border-border border-b px-3 py-2">
            <SectionPill
              active={effectiveSection === null}
              count={totalPages}
              label={STRINGS.all}
              onSelect={selectSection}
              value={null}
            />
            {sections.map((section) => (
              <SectionPill
                active={effectiveSection === section.label}
                count={section.count}
                key={section.label}
                label={section.label}
                onSelect={selectSection}
                value={section.label}
              />
            ))}
          </div>
        )}

        {/*
          `aria-label` restores the accessible name production put on the
          results container (Search.astro:126-128). Base UI's list emits
          `role="listbox"` with no name of its own, and the input's own
          `aria-label` names the input, not the listbox it controls — so
          without this the results region announces as an unnamed listbox.
        */}
        <CommandList
          aria-label={STRINGS.label}
          className="min-h-0 max-h-none flex-1 overflow-y-auto p-2"
        >
          {(group: PaletteGroup) => (
            // The primitive's own group/label structure rather than
            // production's hand-rolled `<p aria-hidden>` beside a
            // `role="group"` div. The reason production hand-rolled it — a
            // listbox subtree admits only groups and options, so the visible
            // header had to be decoration and the machine-readable label had
            // to live on the group — is the same reason to stop hand-rolling
            // it now that a primitive wires `aria-labelledby` for us.
            <CommandGroup className="p-0" heading={group.label} items={group.items} key={group.key}>
              {(row: PaletteRow) => <PaletteItem key={row.key} onClick={handleRowClick} row={row} />}
            </CommandGroup>
          )}
        </CommandList>

        <CommandEmpty className="shrink-0 not-empty:px-4 text-muted-foreground">
          {emptyMessage}
        </CommandEmpty>

        {/*
          The `⌘J` preview hint that sat third in this row is gone, not
          hidden (§9.5, §14.7). It toggled a result-preview pane that
          `theme.css` already suppressed with `!important`, so the hint
          advertised a shortcut that did nothing — and the binding behind it
          is not reproduced either.
        */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-border border-t px-3 py-2 text-muted-foreground text-xs">
          <span />
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className={`${KBD_CLASS} text-[0.65rem]`}>↑</kbd>
              <kbd className={`${KBD_CLASS} text-[0.65rem]`}>↓</kbd>
              {STRINGS.navigate}
            </span>
            <span className="flex items-center gap-1">
              <kbd className={`${KBD_CLASS} text-[0.65rem]`}>↵</kbd>
              {STRINGS.open}
            </span>
          </div>
        </div>
      </Command>
    </CommandDialog>
  );
}

function SectionPill({
  active,
  count,
  label,
  onSelect,
  value,
}: {
  active: boolean;
  count: number;
  label: string;
  onSelect: (value: string | null) => void;
  value: string | null;
}) {
  return (
    <button
      aria-pressed={active}
      className={`${PILL_BASE} ${active ? PILL_ON : PILL_OFF}`}
      onClick={() => onSelect(value)}
      type="button"
    >
      {label} <span className="opacity-60">{count}</span>
    </button>
  );
}

function PaletteItem({
  onClick,
  row,
}: {
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
  row: PaletteRow;
}) {
  return (
    <CommandItem
      className={ROW_CLASS}
      onClick={onClick}
      // Rendered as a real anchor, which is what production's rows were: it
      // is what makes a middle-click or ⌘-click open a result in a new tab,
      // and it is what puts the destination in the status bar on hover. Base
      // UI keeps `role="option"` on it and activates it on Enter by
      // dispatching a genuine DOM click, which `next/link`'s own handler
      // then turns into a soft navigation.
      //
      // `prefetch={false}` because the default would prefetch every visible
      // row: twelve routes per keystroke, for a list that is rewritten on
      // the next one.
      render={<Link href={row.href} prefetch={false} />}
      value={row}
    >
      <span className="mt-0.5 shrink-0 text-muted-foreground">
        <FileIcon aria-hidden="true" size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-normal text-foreground text-sm">
          {row.kind === "popular" ? row.text : <Segments segments={row.hit.title} />}
        </span>
        {/*
          No `block` on the excerpt: `line-clamp-2` sets `display` itself
          (to `-webkit-box`), and overriding it back to `block` silently
          disables the clamp and lets a 180-character excerpt run to full
          height. Production carries the same warning in the same place.
        */}
        {row.kind === "hit" && row.hit.excerpt !== null && (
          <span className="mt-0.5 line-clamp-2 text-muted-foreground text-xs">
            <Segments segments={row.hit.excerpt} />
          </span>
        )}
      </span>
    </CommandItem>
  );
}

/**
 * Renders the matcher's segments as text nodes and `<mark>` elements. This
 * five-line component is the successor to ~60 lines of security-critical
 * code in Blume — `highlight()`, which escaped each segment so a query could
 * not mark the inside of an HTML entity, and `sanitizeExcerpt()`, which
 * reduced provider markup to bare `<mark>` while splitting angle-runs so a
 * deletion could not splice `<<b>script>` into `<script>`. Both existed to
 * make an `innerHTML` assignment safe. There is no HTML string here and no
 * `dangerouslySetInnerHTML`, so there is nothing to escape and nothing to
 * sanitize — which is the argument, and also the thing that stops being true
 * the moment anyone builds a string out of these segments.
 */
function Segments({ segments }: { segments: readonly HighlightSegment[] }) {
  return (
    <>
      {/*
        Keyed by index, which is normally a bug and here is not: this array
        is derived fresh from (text, query) on every render, is never
        reordered or spliced, and carries no state of its own — the index is
        the identity.
      */}
      {segments.map((segment, index) =>
        segment.match ? (
          <mark key={index}>{segment.text}</mark>
        ) : (
          <Fragment key={index}>{segment.text}</Fragment>
        ),
      )}
    </>
  );
}
