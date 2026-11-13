"use client";

import {
  BookOpen,
  Boxes,
  ChevronDown,
  ChevronRight,
  Download,
  LayoutGrid,
  LifeBuoy,
  type LucideIcon,
  Map as MapIcon,
  MessageSquarePlus,
  Palette,
  Rows3,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { BlocksNav, ShellBranch, ShellItem, ShellNav } from "../../lib/shell-nav";
import { useDrawer } from "../drawer-context";
import { FlavourSwitch } from "../flavour/flavour-switch";

const ICONS: Record<string, LucideIcon> = {
  "/docs": BookOpen,
  "/docs/installation": Download,
  "/docs/theming": Palette,
  "/docs/components": Boxes,
  "/components": LayoutGrid,
  "/blocks": Rows3,
  "/pro": Sparkles,
  "/roadmap": MapIcon,
  "/block-request": MessageSquarePlus,
  "/support": LifeBuoy,
};

/** The header's other sections, for the small-screen drawer only: from lg up the header carries them. */
const SITE_LINKS: ShellItem[] = [
  { label: "Pro", href: "/pro" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "Block Request", href: "/block-request" },
  { label: "Support", href: "/support" },
];

type Node = ShellItem | ShellBranch;

function isBranch(node: Node): node is ShellBranch {
  return "items" in node;
}

function contains(node: Node, pathname: string): boolean {
  if (!isBranch(node)) return node.href === pathname;
  return node.href === pathname || node.items.some((item) => item.href === pathname);
}

/** Lets a group that opens on navigation ask the sidebar to bring the current row into view. */
const RevealContext = createContext<() => void>(() => {});

/**
 * The one sidebar of /docs, /components and /blocks: guides, primitives, components and blocks in a
 * single soft card under the site header. `blocks` arrives from the /blocks layout; anywhere else the
 * section fetches /blocks-nav.json the first time it opens, so the docs and gallery stay static.
 */
export function SiteSidebar({ blocks: blocksFromServer, nav }: { blocks?: BlocksNav; nav: ShellNav }) {
  const { open, setOpen } = useDrawer();
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [desktop, setDesktop] = useState(true);
  const [revealTick, setRevealTick] = useState(0);
  const onReveal = useCallback(() => setRevealTick((n) => n + 1), []);

  const [blocks, setBlocks] = useState<BlocksNav | undefined>(blocksFromServer);
  const loading = useRef(false);
  const loadBlocks = useCallback(() => {
    if (blocks || loading.current) return;
    loading.current = true;
    fetch("/blocks-nav.json")
      .then((response) => (response.ok ? (response.json() as Promise<BlocksNav>) : undefined))
      .then((data) => data && setBlocks(data))
      .catch((error) => console.error("[sidebar] blocks nav:", error))
      .finally(() => {
        loading.current = false;
      });
  }, [blocks]);

  useEffect(() => {
    if (blocksFromServer) setBlocks(blocksFromServer);
  }, [blocksFromServer]);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 64rem)");
    setDesktop(query.matches);
    const onChange = (event: MediaQueryListEvent) => {
      setDesktop(event.matches);
      if (event.matches) setOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [setOpen]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run on navigation and when a group opens
  useEffect(() => {
    const box = scrollRef.current;
    if (!box) return;
    let link: HTMLElement | null = null;
    for (const anchor of box.querySelectorAll<HTMLElement>('a[aria-current="page"]')) {
      if (anchor.getClientRects().length) {
        link = anchor;
        break;
      }
    }
    if (!link) return;
    const boxRect = box.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    if (linkRect.top >= boxRect.top && linkRect.bottom <= boxRect.bottom) return;
    box.scrollTop += linkRect.top - boxRect.top - (box.clientHeight - linkRect.height) / 2;
  }, [pathname, revealTick]);

  const primitives: Node[] = [
    ...(nav.primitives.href ? [{ label: "All primitives", href: nav.primitives.href }] : []),
    ...nav.primitives.items,
  ];
  const components: Node[] = [{ label: "All components", href: "/components", count: nav.components.total }, ...nav.components.branches];
  const blockNodes: Node[] = [
    { label: "All blocks", href: "/blocks", count: blocks?.total },
    ...(blocks?.branches.map((branch) => ({ ...branch, items: [{ label: "Overview", href: branch.href ?? "/blocks", count: branch.count }, ...branch.items] })) ?? []),
  ];

  return (
    <>
      <aside
        aria-label="Primary"
        className={`site-sidebar fixed start-0 top-(--header-h) z-[35] flex h-[calc(100dvh-var(--header-h))] w-72 max-w-[85vw] flex-col bg-background p-2 shadow-overlay ring-1 ring-foreground/10 lg:ring-0 transition-transform lg:sticky lg:top-[calc(var(--header-h)+0.75rem)] lg:z-auto lg:mt-3 lg:ms-3 lg:mb-3 lg:h-[calc(100dvh-var(--header-h)-1.5rem)] lg:w-auto lg:max-w-none lg:translate-x-0! lg:rounded-3xl lg:border lg:border-docs-panel-edge lg:bg-docs-panel lg:shadow-docs-panel ${
          open ? "translate-x-0" : "-translate-x-[105%] rtl:translate-x-[105%]"
        }`}
        inert={!desktop && !open}
      >
        {/* The primitive flavour applies to every primitive, demo and component; Pro blocks have one flavour. */}
        {!pathname.startsWith("/blocks") && (
          <div className="flex items-center justify-between gap-2 px-2.5 pt-2 pb-1">
            <span aria-hidden="true" className="font-semibold text-docs-tertiary text-xs uppercase tracking-[0.3px]">
              Built on
            </span>
            <FlavourSwitch />
          </div>
        )}
        {/* Soft fades at both ends instead of hard edges where the list scrolls under the card. */}
        <div
          className="flex-1 overflow-y-auto px-1 py-2 [mask-image:linear-gradient(to_bottom,transparent,#000_12px,#000_calc(100%-16px),transparent)] scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
          ref={scrollRef}
        >
          <RevealContext.Provider value={onReveal}>
            <Section defaultOpen label="Get started" nodes={nav.start}>
              <Tree icons nodes={nav.start} />
            </Section>
            <Section count={nav.primitives.items.length} label="Primitives" nodes={primitives}>
              <Tree nodes={primitives} />
            </Section>
            <Section count={nav.components.total} label="Components" nodes={components} prefix="/components">
              <Tree nodes={components} />
            </Section>
            <Section count={blocks?.total} label="Blocks" nodes={blockNodes} onOpen={loadBlocks} prefix="/blocks">
              <Tree nodes={blockNodes} />
            </Section>
            <div className="lg:hidden">
              <Section defaultOpen label="Site" nodes={SITE_LINKS}>
                <Tree icons nodes={SITE_LINKS} />
              </Section>
            </div>
          </RevealContext.Provider>
        </div>
      </aside>
      {open && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-[30] cursor-pointer border-0 bg-black/30 backdrop-blur-[2px] lg:hidden"
          onClick={() => setOpen(false)}
          type="button"
        />
      )}
    </>
  );
}

/** An uppercase, collapsible section. It opens itself while the current page lives inside it. */
function Section({
  children,
  count,
  defaultOpen = false,
  label,
  nodes,
  onOpen,
  prefix,
}: {
  children: ReactNode;
  count?: number;
  defaultOpen?: boolean;
  label: string;
  nodes: Node[];
  onOpen?: () => void;
  /** A route prefix that also counts as inside, for pages the nodes don't list (a block category before the list loads). */
  prefix?: string;
}) {
  const pathname = usePathname();
  const onReveal = useContext(RevealContext);
  const activeInside =
    nodes.some((node) => contains(node, pathname)) ||
    (prefix !== undefined && (pathname === prefix || pathname.startsWith(`${prefix}/`)));
  const [open, setOpen] = useState(defaultOpen || activeInside);

  useEffect(() => {
    if (activeInside) {
      setOpen(true);
      onReveal();
    }
  }, [activeInside, onReveal]);

  useEffect(() => {
    if (open) onOpen?.();
  }, [open, onOpen]);

  return (
    <details className="group/section mb-1" onToggle={(event) => setOpen(event.currentTarget.open)} open={open}>
      <summary
        className={`flex cursor-pointer list-none items-center justify-between rounded-md px-2.5 pt-2.5 pb-1.5 font-semibold text-xs uppercase tracking-[0.3px] transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden ${
          activeInside ? "text-muted-foreground" : "text-docs-tertiary"
        }`}
      >
        <span className="inline-flex items-center gap-1.5">
          {label}
          {count !== undefined && <span className="font-medium tabular-nums tracking-normal opacity-80">{count}</span>}
        </span>
        <ChevronDown
          aria-hidden="true"
          className="-rotate-90 transition-transform duration-200 group-open/section:rotate-0"
          size={14}
        />
      </summary>
      {children}
    </details>
  );
}

const rowClass =
  "site-tree-row flex h-8 items-center gap-2.5 rounded-lg ps-8 pe-2.5 font-medium text-muted-foreground text-sm transition-colors duration-150 hover:text-foreground";

/** A list on a rail; the rail and its rounded elbows are drawn by `.site-tree` in globals.css. */
function Tree({ icons = false, nodes }: { icons?: boolean; nodes: Node[] }) {
  return (
    <ul className="site-tree mb-1">
      {nodes.map((node) => (
        <li key={node.href ?? (isBranch(node) ? node.id : node.label)}>
          {isBranch(node) ? <Branch branch={node} /> : <Row icon={icons} item={node} />}
        </li>
      ))}
    </ul>
  );
}

function Row({ icon, item }: { icon: boolean; item: ShellItem }) {
  const pathname = usePathname();
  const { setOpen } = useDrawer();
  const Icon = ICONS[item.href];
  const current = item.href === pathname;
  const showIcon = (icon || item.label.startsWith("All ")) && Icon;

  return (
    <Link
      aria-current={current ? "page" : undefined}
      className={`${rowClass} aria-[current=page]:bg-docs-active aria-[current=page]:text-foreground`}
      href={item.href}
      onClick={() => setOpen(false)}
    >
      {showIcon && <Icon aria-hidden="true" className="shrink-0" size={16} strokeWidth={1.75} />}
      <span className="flex-1 truncate">{item.label}</span>
      {item.count !== undefined && (
        <span
          className={`shrink-0 text-xs tabular-nums transition-colors ${current ? "text-muted-foreground" : "text-docs-tertiary"}`}
        >
          {item.count}
        </span>
      )}
    </Link>
  );
}

/** A collapsible row inside a section (a component family, a block group) with its own nested rail. */
function Branch({ branch }: { branch: ShellBranch }) {
  const pathname = usePathname();
  const onReveal = useContext(RevealContext);
  const activeInside = contains(branch, pathname);
  const [open, setOpen] = useState(activeInside);

  useEffect(() => {
    if (activeInside) {
      setOpen(true);
      onReveal();
    }
  }, [activeInside, onReveal]);

  return (
    <details className="group/branch" onToggle={(event) => setOpen(event.currentTarget.open)} open={open}>
      <summary className={`${rowClass} cursor-pointer list-none [&::-webkit-details-marker]:hidden ${activeInside ? "text-foreground" : ""}`}>
        <span className="flex-1 truncate">{branch.label}</span>
        <span className="text-docs-tertiary text-xs tabular-nums">{branch.count}</span>
        <ChevronRight
          aria-hidden="true"
          className="shrink-0 text-docs-tertiary transition-transform duration-200 group-open/branch:rotate-90"
          size={13}
        />
      </summary>
      <div className="ms-4">
        <Tree nodes={branch.items} />
      </div>
    </details>
  );
}
