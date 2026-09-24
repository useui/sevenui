"use client";

import { Autocomplete } from "@base-ui/react/autocomplete";
import { BoxIcon, FileIcon, FileTextIcon, LayoutTemplateIcon, SearchIcon, type LucideIcon } from "lucide-react";
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
  SITE_SECTIONS,
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

const STRINGS = {
  label: "Search SevenUI",
  placeholder: "Search docs, components, blocks…",
  popular: "Popular",
  results: "Results",
  noResults: "No results found.",
  all: "All",
  navigate: "navigate",
  open: "open",
  loading: "…",
  error: "Something went wrong. Please try again.",
} as const;

const ROW_CLASS =
  "w-full cursor-pointer items-start gap-2.5 border border-transparent px-2.5 py-2 text-start text-inherit transition-colors hover:no-underline data-highlighted:border-border [&_mark]:rounded-sm [&_mark]:bg-accent/25 [&_mark]:text-inherit";

const PILL_BASE =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium text-xs transition-colors";
const PILL_ON = "border-transparent bg-foreground text-background";
const PILL_OFF = "border-border text-muted-foreground hover:text-foreground";

const KBD_CLASS = "rounded border border-border bg-muted px-1 py-0.5 font-mono";

const DIALOG_CLASS =
  "top-[8vh] flex h-[min(480px,90dvh)] w-[min(40rem,94vw)] max-w-none translate-y-0 flex-col gap-0 border border-border bg-background/80 text-foreground shadow-2xl ring-0 backdrop-blur-xl sm:top-1/2 sm:max-w-none sm:-translate-y-1/2";

/** Row icon by section; docs and primitive pages keep the plain page icon. */
const SECTION_ICONS: Record<string, LucideIcon> = {
  [SITE_SECTIONS.components]: BoxIcon,
  [SITE_SECTIONS.blocks]: LayoutTemplateIcon,
  [SITE_SECTIONS.pages]: FileTextIcon,
};

function rowIcon(href: string, section: string | undefined): LucideIcon {
  if (section !== undefined) return SECTION_ICONS[section] ?? FileIcon;
  if (href.startsWith("/components")) return BoxIcon;
  if (href.startsWith("/blocks")) return LayoutTemplateIcon;
  return href.startsWith("/docs") ? FileIcon : FileTextIcon;
}

type LoadStatus = "idle" | "loading" | "ready" | "error";

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

  const statusRef = useRef<LoadStatus>("idle");

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

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
      statusRef.current = next;
      if (!mountedRef.current) return;
      if (prepared !== null) setEntries(prepared);
      setStatus(next);
    })();
  }, [open]);

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
  const sections = useMemo(() => countSections(allHits), [allHits]);
  const sectionStripVisible = sections.length >= 2;
  const sectionIsLive = activeSection !== null && sections.some((s) => s.label === activeSection);
  const effectiveSection = sectionIsLive ? activeSection : null;

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

  let emptyMessage = "";
  if (normalizedQuery !== "") {
    if (status === "error") emptyMessage = STRINGS.error;
    else if (status === "ready") emptyMessage = STRINGS.noResults;
    else emptyMessage = STRINGS.loading;
  }

  const selectSection = useCallback((label: string | null) => {
    setActiveSection(label);
    inputRef.current?.focus();
  }, []);

  const handleRowClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
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
        items={groups}
        onValueChange={setQuery}
        value={query}
      >
        <div className="flex shrink-0 items-center gap-2.5 border-border border-b px-4 py-3 text-muted-foreground">
          <SearchIcon aria-hidden="true" className="shrink-0" size={18} />
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

        <CommandList
          aria-label={STRINGS.label}
          className="min-h-0 max-h-none flex-1 overflow-y-auto p-2"
        >
          {(group: PaletteGroup) => (
            <CommandGroup className="p-0" heading={group.label} items={group.items} key={group.key}>
              {(row: PaletteRow) => <PaletteItem key={row.key} onClick={handleRowClick} row={row} />}
            </CommandGroup>
          )}
        </CommandList>

        <CommandEmpty className="shrink-0 not-empty:px-4 text-muted-foreground">
          {emptyMessage}
        </CommandEmpty>

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
  const Icon = rowIcon(row.href, row.kind === "hit" ? row.hit.entry.section : undefined);
  return (
    <CommandItem
      className={ROW_CLASS}
      onClick={onClick}
      render={<Link href={row.href} prefetch={false} />}
      value={row}
    >
      <span className="mt-0.5 shrink-0 text-muted-foreground">
        <Icon aria-hidden="true" size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-normal text-foreground text-sm">
          {row.kind === "popular" ? row.text : <Segments segments={row.hit.title} />}
        </span>
        {row.kind === "hit" && row.hit.excerpt !== null && (
          <span className="mt-0.5 line-clamp-2 text-muted-foreground text-xs">
            <Segments segments={row.hit.excerpt} />
          </span>
        )}
      </span>
    </CommandItem>
  );
}

function Segments({ segments }: { segments: readonly HighlightSegment[] }) {
  return (
    <>
      {segments.map((segment, index) =>
        segment.match ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: segments are recomputed whole and never reorder
          <mark key={index}>{segment.text}</mark>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: segments are recomputed whole and never reorder
          <Fragment key={index}>{segment.text}</Fragment>
        ),
      )}
    </>
  );
}
