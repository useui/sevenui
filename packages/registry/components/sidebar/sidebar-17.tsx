"use client";

import * as React from "react";
import {
  CheckIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  FileTextIcon,
  MoreHorizontalIcon,
  PlusIcon,
  StarIcon,
  StarOffIcon,
  Trash2Icon,
} from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/base/ui/breadcrumb";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
} from "@/registry/base/ui/sidebar";

type Page = {
  id: string;
  title: string;
  parent?: string;
  edited: string;
  excerpt: string;
};

type Workspace = {
  id: string;
  name: string;
  plan: string;
  initial: string;
  pages: Page[];
  favorites: string[];
};

const initialWorkspaces: Workspace[] = [
  {
    id: "orbit",
    name: "Orbit Labs",
    plan: "Team · 18 members",
    initial: "O",
    favorites: ["oncall"],
    pages: [
      { id: "handbook", title: "Engineering handbook", edited: "Edited Sep 20 by Omar", excerpt: "How we plan, build, review, and ship. Start with the release process if you're new." },
      { id: "oncall", title: "On-call runbook", parent: "handbook", edited: "Edited 2 hours ago by you", excerpt: "Page the secondary after 15 minutes without acknowledgement. Every incident gets a timeline in #inc-channel." },
      { id: "review", title: "Code review guide", parent: "handbook", edited: "Edited Sep 12 by Priya", excerpt: "Review within one business day. Approve with nits; block only on correctness, security, or data loss." },
      { id: "release", title: "Release process", parent: "handbook", edited: "Edited Aug 28 by Tom", excerpt: "Releases go out Tuesday and Thursday at 14:00 UTC behind a feature flag." },
      { id: "specs", title: "Product specs", edited: "Edited yesterday by Aisha", excerpt: "One page per initiative. Problem first, then constraints, then the proposal." },
      { id: "billing", title: "Q4 billing revamp", parent: "specs", edited: "Edited yesterday by Aisha", excerpt: "Move from seat-based to usage-based pricing for API calls above 1M per month." },
      { id: "offline", title: "Mobile offline mode", parent: "specs", edited: "Edited Sep 3 by Mei", excerpt: "Queue writes locally for up to 72 hours and resolve conflicts last-writer-wins per field." },
    ],
  },
  {
    id: "personal",
    name: "Personal",
    plan: "Free · just you",
    initial: "P",
    favorites: [],
    pages: [
      { id: "reading", title: "Reading list", edited: "Edited Sep 18", excerpt: "Books and long reads to get through before the end of the year." },
      { id: "books", title: "Books 2026", parent: "reading", edited: "Edited Sep 18", excerpt: "Currently reading: The Design of Everyday Things (revised edition)." },
      { id: "lisbon", title: "Lisbon trip", edited: "Edited Sep 2", excerpt: "Oct 14–19. Book the tram 28 early morning, and dinner in Alfama on Friday." },
    ],
  },
];

export default function Sidebar17() {
  const [workspaces, setWorkspaces] = React.useState(initialWorkspaces);
  const [workspaceId, setWorkspaceId] = React.useState("orbit");
  const [activeId, setActiveId] = React.useState("oncall");
  // Controlled so selecting a nested page (from favorites, breadcrumbs or a new
  // page) can expand its parent after the tree has mounted.
  const [expanded, setExpanded] = React.useState<string[]>(["handbook"]);

  const workspace = workspaces.find((item) => item.id === workspaceId) ?? workspaces[0];
  const roots = workspace.pages.filter((page) => !page.parent);
  const childrenOf = (id: string) => workspace.pages.filter((page) => page.parent === id);
  const active = workspace.pages.find((page) => page.id === activeId) ?? roots[0];
  const parent = active?.parent
    ? workspace.pages.find((page) => page.id === active.parent)
    : undefined;
  const favorites = workspace.favorites
    .map((id) => workspace.pages.find((page) => page.id === id))
    .filter((page): page is Page => Boolean(page));

  function select(id: string, pages: Page[] = workspace.pages) {
    const page = pages.find((item) => item.id === id);
    setActiveId(id);
    if (!page) return;
    setExpanded((current) => {
      const next = new Set(current);
      if (page.parent) next.add(page.parent);
      if (pages.some((item) => item.parent === page.id)) next.add(page.id);
      return [...next];
    });
  }

  function setBranchOpen(id: string, open: boolean) {
    setExpanded((current) =>
      open ? [...new Set([...current, id])] : current.filter((item) => item !== id),
    );
  }

  function updateWorkspace(change: (current: Workspace) => Workspace) {
    setWorkspaces((current) =>
      current.map((item) => (item.id === workspace.id ? change(item) : item)),
    );
  }

  function switchWorkspace(id: string) {
    const next = workspaces.find((item) => item.id === id);
    setWorkspaceId(id);
    if (next?.pages[0]) select(next.pages[0].id, next.pages);
    else setActiveId("");
  }

  function toggleFavorite(id: string) {
    updateWorkspace((current) => ({
      ...current,
      favorites: current.favorites.includes(id)
        ? current.favorites.filter((item) => item !== id)
        : [...current.favorites, id],
    }));
  }

  function trash(id: string) {
    const removed = new Set([id, ...childrenOf(id).map((page) => page.id)]);
    updateWorkspace((current) => ({
      ...current,
      pages: current.pages.filter((page) => !removed.has(page.id)),
      favorites: current.favorites.filter((item) => !removed.has(item)),
    }));
    if (active && removed.has(active.id)) {
      setActiveId(roots.find((page) => !removed.has(page.id))?.id ?? "");
    }
  }

  function createPage() {
    const id = `page-${Date.now()}`;
    updateWorkspace((current) => ({
      ...current,
      pages: [
        ...current.pages,
        { id, title: "Untitled", edited: "Just now", excerpt: "Empty page. Give it a title and start writing." },
      ],
    }));
    setActiveId(id);
  }

  function pageActions(page: Page) {
    const isFavorite = workspace.favorites.includes(page.id);
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<SidebarMenuAction showOnHover aria-label={`More actions for ${page.title}`} />}
        >
          <MoreHorizontalIcon aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="w-48">
          <DropdownMenuItem onClick={() => toggleFavorite(page.id)}>
            {isFavorite ? <StarOffIcon aria-hidden="true" /> : <StarIcon aria-hidden="true" />}
            {isFavorite ? "Remove from favorites" : "Add to favorites"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => trash(page.id)}>
            <Trash2Icon aria-hidden="true" />
            Move to trash
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="@container w-full max-w-3xl overflow-hidden rounded-xl border bg-background">
      <SidebarProvider className="min-h-0 flex-col @xl:h-[500px] @xl:flex-row">
        <Sidebar
          collapsible="none"
          role="navigation"
          aria-label="Workspace pages"
          className="w-full border-b @xl:w-64 @xl:border-r @xl:border-b-0"
        >
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<SidebarMenuButton size="lg" aria-label="Switch workspace" />}
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground"
                    >
                      {workspace.initial}
                    </span>
                    <span className="grid min-w-0 flex-1 text-left leading-tight">
                      <span className="truncate font-medium">{workspace.name}</span>
                      <span className="truncate text-xs text-sidebar-foreground/70">
                        {workspace.plan}
                      </span>
                    </span>
                    <ChevronsUpDownIcon aria-hidden="true" className="ml-auto opacity-60" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-(--anchor-width) min-w-56">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
                      {workspaces.map((item) => (
                        <DropdownMenuItem key={item.id} onClick={() => switchWorkspace(item.id)}>
                          <span
                            aria-hidden="true"
                            className="flex size-5 items-center justify-center rounded-md border text-xs font-medium"
                          >
                            {item.initial}
                          </span>
                          {item.name}
                          {item.id === workspace.id && (
                            <CheckIcon aria-hidden="true" className="ml-auto" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent className="max-h-72 @xl:max-h-none">
            {favorites.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel>Favorites</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu aria-label="Favorite pages">
                    {favorites.map((page) => (
                      <SidebarMenuItem key={page.id}>
                        <SidebarMenuButton
                          isActive={page.id === active?.id}
                          aria-current={page.id === active?.id ? "page" : undefined}
                          onClick={() => select(page.id)}
                        >
                          <StarIcon aria-hidden="true" className="fill-current text-warning" />
                          <span>{page.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
            <SidebarGroup>
              <SidebarGroupLabel>Pages</SidebarGroupLabel>
              <SidebarGroupAction title="New page" onClick={createPage}>
                <PlusIcon aria-hidden="true" />
                <span className="sr-only">New page</span>
              </SidebarGroupAction>
              <SidebarGroupContent>
                <SidebarMenu aria-label="Pages">
                  {roots.map((page) => {
                    const children = childrenOf(page.id);
                    if (children.length === 0) {
                      return (
                        <SidebarMenuItem key={page.id}>
                          <SidebarMenuButton
                            isActive={page.id === active?.id}
                            aria-current={page.id === active?.id ? "page" : undefined}
                            onClick={() => select(page.id)}
                          >
                            <FileTextIcon aria-hidden="true" />
                            <span>{page.title}</span>
                          </SidebarMenuButton>
                          {pageActions(page)}
                        </SidebarMenuItem>
                      );
                    }
                    return (
                      <Collapsible
                        key={page.id}
                        open={expanded.includes(page.id)}
                        onOpenChange={(open) => setBranchOpen(page.id, open)}
                        render={<SidebarMenuItem />}
                      >
                        <SidebarMenuButton
                          isActive={page.id === active?.id}
                          aria-current={page.id === active?.id ? "page" : undefined}
                          onClick={() => select(page.id)}
                          className="pr-14!"
                        >
                          <FileTextIcon aria-hidden="true" />
                          <span>{page.title}</span>
                        </SidebarMenuButton>
                        <CollapsibleTrigger
                          render={
                            <SidebarMenuAction
                              className="group/page right-7"
                              aria-label={`Toggle ${page.title} subpages`}
                            />
                          }
                        >
                          <ChevronRightIcon
                            aria-hidden="true"
                            className="transition-transform group-data-panel-open/page:rotate-90"
                          />
                        </CollapsibleTrigger>
                        {pageActions(page)}
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {children.map((child) => (
                              <SidebarMenuSubItem key={child.id}>
                                <SidebarMenuSubButton
                                  isActive={child.id === active?.id}
                                  aria-current={child.id === active?.id ? "page" : undefined}
                                  render={<button type="button" className="w-full" />}
                                  onClick={() => select(child.id)}
                                >
                                  <span>{child.title}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <article
          aria-labelledby="sidebar-17-title"
          className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-4 @xl:p-8"
        >
          {active ? (
            <>
              <Breadcrumb>
                <BreadcrumbList className="text-xs">
                  <BreadcrumbItem>
                    {workspace.name}
                  </BreadcrumbItem>
                  {parent && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbLink
                          render={<button type="button" />}
                          onClick={() => select(parent.id)}
                        >
                          {parent.title}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    </>
                  )}
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{active.title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <div className="flex flex-col gap-1">
                <h2 id="sidebar-17-title" className="text-xl font-semibold text-balance">
                  {active.title}
                </h2>
                <p className="text-xs text-muted-foreground">{active.edited}</p>
              </div>
              <p className="max-w-prose text-sm leading-relaxed text-pretty">
                {active.excerpt}
              </p>
              {childrenOf(active.id).length > 0 && (
                <ul className="flex flex-col gap-1 border-t pt-4" aria-label="Subpages">
                  {childrenOf(active.id).map((child) => (
                    <li key={child.id}>
                      <button
                        type="button"
                        onClick={() => select(child.id)}
                        className="flex items-center gap-2 rounded-md px-1 py-1 text-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <FileTextIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                        {child.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <div className="m-auto flex flex-col items-center gap-1 text-center">
              <h2 id="sidebar-17-title" className="text-sm font-medium">
                This workspace is empty
              </h2>
              <p className="text-xs text-muted-foreground">
                Create a page from the sidebar to get started.
              </p>
            </div>
          )}
        </article>
      </SidebarProvider>
    </div>
  );
}
