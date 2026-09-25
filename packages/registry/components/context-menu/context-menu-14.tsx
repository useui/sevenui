"use client";

import {
  ChevronRight,
  Clipboard,
  FilePlus,
  FileCode2,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  GitBranch,
  PanelRight,
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react";
import * as React from "react";

import { cn } from "cn";

import { Button } from "@/registry/base/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/registry/base/ui/context-menu";

// macOS browsers never turn Shift+F10 into a contextmenu event (Windows and
// Linux do), so the shortcut the hint advertises is forwarded by hand there.
function openMenuWithShiftF10(event: React.KeyboardEvent<HTMLElement>) {
  if (event.key !== "F10" || !event.shiftKey) return;
  if (!/Mac|iPhone|iPad/.test(navigator.userAgent)) return;
  event.preventDefault();
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + 8,
      clientY: rect.top + 8,
    }),
  );
}

type GitStatus = "M" | "U";

type TreeNode = {
  id: string;
  name: string;
  parent: string | null;
  kind: "folder" | "file";
  git?: GitStatus;
};

const ROOT = "acme-web";

const initialNodes: TreeNode[] = [
  { id: "src", name: "src", parent: null, kind: "folder" },
  { id: "components", name: "components", parent: "src", kind: "folder" },
  {
    id: "button",
    name: "button.tsx",
    parent: "components",
    kind: "file",
    git: "M",
  },
  { id: "dialog", name: "dialog.tsx", parent: "components", kind: "file" },
  { id: "lib", name: "lib", parent: "src", kind: "folder" },
  {
    id: "utils",
    name: "format-date.ts",
    parent: "lib",
    kind: "file",
    git: "U",
  },
  { id: "app", name: "app.tsx", parent: "src", kind: "file", git: "M" },
  { id: "pkg", name: "package.json", parent: null, kind: "file" },
  { id: "readme", name: "README.md", parent: null, kind: "file" },
];

const gitLabel: Record<GitStatus, string> = {
  M: "modified",
  U: "untracked",
};

function childrenOf(nodes: TreeNode[], parent: string | null) {
  return nodes
    .filter((node) => node.parent === parent)
    .sort((a, b) =>
      a.kind === b.kind
        ? a.name.localeCompare(b.name)
        : a.kind === "folder"
          ? -1
          : 1,
    );
}

function pathOf(nodes: TreeNode[], id: string): string {
  const node = nodes.find((item) => item.id === id);
  if (!node) return "";
  return node.parent ? `${pathOf(nodes, node.parent)}/${node.name}` : node.name;
}

export default function ContextMenu14() {
  const [nodes, setNodes] = React.useState(initialNodes);
  const [expanded, setExpanded] = React.useState<string[]>([
    "src",
    "components",
  ]);
  const [activeId, setActiveId] = React.useState("button");
  const [renamingId, setRenamingId] = React.useState<string | null>(null);
  const [draftName, setDraftName] = React.useState("");
  const [status, setStatus] = React.useState("");
  const renameRef = React.useRef<HTMLInputElement>(null);
  const counter = React.useRef(0);
  // Rename starts only after the menu has fully closed, so focus returning
  // to the trigger cannot steal it back from the rename input.
  const pendingRename = React.useRef<TreeNode | null>(null);
  const renameClaimsFocus = React.useRef(false);

  React.useEffect(() => {
    if (!renamingId) return;
    renameRef.current?.focus();
    renameRef.current?.select();
  }, [renamingId]);

  function startRename(node: TreeNode) {
    setDraftName(node.name);
    setRenamingId(node.id);
  }

  function commitRename() {
    const name = draftName.trim();
    if (renamingId && name) {
      setNodes((current) =>
        current.map((node) =>
          node.id === renamingId ? { ...node, name } : node,
        ),
      );
    }
    setRenamingId(null);
  }

  function create(parent: TreeNode, kind: TreeNode["kind"]) {
    counter.current += 1;
    const node: TreeNode = {
      id: `new-${counter.current}`,
      name: kind === "file" ? "untitled.ts" : "new-folder",
      parent: parent.id,
      kind,
      git: kind === "file" ? "U" : undefined,
    };
    setNodes((current) => [...current, node]);
    setExpanded((current) =>
      current.includes(parent.id) ? current : [...current, parent.id],
    );
    pendingRename.current = node;
    renameClaimsFocus.current = true;
  }

  function copyPath(value: string) {
    void navigator.clipboard?.writeText(value).catch(() => {});
    setStatus(`Copied ${value}`);
  }

  function remove(id: string) {
    const doomed = new Set([id]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const node of nodes) {
        if (node.parent && doomed.has(node.parent) && !doomed.has(node.id)) {
          doomed.add(node.id);
          grew = true;
        }
      }
    }
    setNodes((current) => current.filter((node) => !doomed.has(node.id)));
    if (doomed.has(activeId)) setActiveId("");
  }

  function renderLevel(parent: string | null, depth: number): React.ReactNode {
    const level = childrenOf(nodes, parent);
    if (level.length === 0) return null;
    return (
      <ul className="flex flex-col">
        {level.map((node) => {
          const isFolder = node.kind === "folder";
          const isOpen = expanded.includes(node.id);
          const isRenaming = renamingId === node.id;
          const path = pathOf(nodes, node.id);
          const Icon = isFolder
            ? isOpen
              ? FolderOpen
              : Folder
            : node.name.endsWith(".md") || node.name.endsWith(".json")
              ? FileText
              : FileCode2;

          return (
            <li key={node.id}>
              {isRenaming ? (
                <div
                  className="flex items-center gap-1.5 py-0.5 pr-2"
                  style={{ paddingLeft: depth * 12 + 22 }}
                >
                  <Icon
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground"
                  />
                  <input
                    ref={renameRef}
                    aria-label={`Rename ${node.name}`}
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") commitRename();
                      if (event.key === "Escape") setRenamingId(null);
                    }}
                    className="h-6 min-w-0 flex-1 rounded-sm border border-ring bg-background px-1.5 font-mono text-xs outline-none ring-2 ring-ring/30"
                  />
                </div>
              ) : (
                <ContextMenu
                  onOpenChangeComplete={(open) => {
                    if (!open && pendingRename.current) {
                      startRename(pendingRename.current);
                      pendingRename.current = null;
                    }
                  }}
                >
                  <ContextMenuTrigger
                    onKeyDown={openMenuWithShiftF10}
                    render={<button type="button" />}
                    aria-expanded={isFolder ? isOpen : undefined}
                    aria-current={activeId === node.id ? "true" : undefined}
                    aria-label={`${node.name}${node.git ? `, ${gitLabel[node.git]}` : ""}`}
                    onClick={() => {
                      if (isFolder) {
                        setExpanded((current) =>
                          isOpen
                            ? current.filter((id) => id !== node.id)
                            : [...current, node.id],
                        );
                      } else {
                        setActiveId(node.id);
                      }
                    }}
                    className={cn(
                      "flex h-7 w-full items-center gap-1.5 rounded-sm pr-2 text-left font-mono text-xs outline-none hover:bg-sidebar-accent/70 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset data-popup-open:bg-sidebar-accent data-popup-open:ring-1 data-popup-open:ring-ring/40",
                      activeId === node.id &&
                        "bg-sidebar-accent text-sidebar-accent-foreground",
                    )}
                    style={{ paddingLeft: depth * 12 + 6 }}
                  >
                    <ChevronRight
                      aria-hidden="true"
                      className={cn(
                        "size-3.5 shrink-0 text-muted-foreground transition-transform",
                        isOpen && "rotate-90",
                        !isFolder && "invisible",
                      )}
                    />
                    <Icon
                      aria-hidden="true"
                      className="size-4 shrink-0 text-muted-foreground"
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {node.name}
                    </span>
                    {node.git ? (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded-xs text-[10px] font-semibold",
                          node.git === "M"
                            ? "bg-warning text-warning-foreground"
                            : "bg-success text-success-foreground",
                        )}
                      >
                        {node.git}
                      </span>
                    ) : null}
                  </ContextMenuTrigger>
                  <ContextMenuContent
                    className="w-60"
                    // A rename started from this menu owns focus next; returning
                    // it to this row would blur the rename input straight away.
                    finalFocus={() => {
                      const keep = !renameClaimsFocus.current;
                      renameClaimsFocus.current = false;
                      return keep;
                    }}
                  >
                    {isFolder ? (
                      <>
                        <ContextMenuItem onClick={() => create(node, "file")}>
                          <FilePlus aria-hidden="true" />
                          New file…
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => create(node, "folder")}>
                          <FolderPlus aria-hidden="true" />
                          New folder…
                        </ContextMenuItem>
                      </>
                    ) : (
                      <>
                        <ContextMenuItem onClick={() => setActiveId(node.id)}>
                          <FileCode2 aria-hidden="true" />
                          Open
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() =>
                            setStatus(`Opened ${node.name} to the side.`)
                          }
                        >
                          <PanelRight aria-hidden="true" />
                          Open to the side
                          <ContextMenuShortcut>⌘↵</ContextMenuShortcut>
                        </ContextMenuItem>
                      </>
                    )}
                    <ContextMenuSeparator />
                    <ContextMenuSub>
                      <ContextMenuSubTrigger>
                        <Clipboard aria-hidden="true" />
                        Copy path
                      </ContextMenuSubTrigger>
                      <ContextMenuSubContent className="w-64">
                        <ContextMenuItem
                          onClick={() => copyPath(`~/code/${ROOT}/${path}`)}
                        >
                          Absolute path
                          <ContextMenuShortcut>⌥⌘C</ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => copyPath(path)}>
                          Relative path
                          <ContextMenuShortcut>⇧⌥⌘C</ContextMenuShortcut>
                        </ContextMenuItem>
                      </ContextMenuSubContent>
                    </ContextMenuSub>
                    {node.git ? (
                      <ContextMenuSub>
                        <ContextMenuSubTrigger>
                          <GitBranch aria-hidden="true" />
                          Source control
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                          <ContextMenuItem
                            onClick={() => {
                              setNodes((current) =>
                                current.map((item) =>
                                  item.id === node.id
                                    ? { ...item, git: undefined }
                                    : item,
                                ),
                              );
                              setStatus(`Staged ${path}.`);
                            }}
                          >
                            Stage changes
                          </ContextMenuItem>
                          <ContextMenuItem
                            variant="destructive"
                            onClick={() => {
                              if (node.git === "U") {
                                remove(node.id);
                              } else {
                                setNodes((current) =>
                                  current.map((item) =>
                                    item.id === node.id
                                      ? { ...item, git: undefined }
                                      : item,
                                  ),
                                );
                              }
                              setStatus(`Discarded changes in ${path}.`);
                            }}
                          >
                            Discard changes
                          </ContextMenuItem>
                        </ContextMenuSubContent>
                      </ContextMenuSub>
                    ) : null}
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onClick={() => {
                        pendingRename.current = node;
                        renameClaimsFocus.current = true;
                      }}
                    >
                      <Pencil aria-hidden="true" />
                      Rename…
                      <ContextMenuShortcut>F2</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuItem
                      variant="destructive"
                      onClick={() => {
                        remove(node.id);
                        setStatus(`Moved ${path} to Trash.`);
                      }}
                    >
                      <Trash2 aria-hidden="true" />
                      Delete
                      <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              )}
              {isFolder && isOpen ? renderLevel(node.id, depth + 1) : null}
            </li>
          );
        })}
      </ul>
    );
  }

  const activePath = activeId ? pathOf(nodes, activeId) : "";
  const changes = nodes.filter((node) => node.git).length;

  return (
    <section
      aria-labelledby="context-menu-14-title"
      className="flex w-full max-w-xs flex-col overflow-hidden rounded-xl border bg-sidebar text-sidebar-foreground"
    >
      <header className="flex items-center justify-between gap-2 border-b border-sidebar-border px-3 py-2">
        <h3
          id="context-menu-14-title"
          className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
        >
          Explorer · {ROOT}
        </h3>
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground tabular-nums">
          <GitBranch aria-hidden="true" className="size-3" />
          {changes} {changes === 1 ? "change" : "changes"}
        </span>
      </header>
      <nav aria-label="Project files" className="p-1.5">
        {nodes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-2 py-6 text-center">
            <p className="text-xs text-muted-foreground">
              This workspace is empty.
            </p>
            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                setNodes(initialNodes);
                setExpanded(["src", "components"]);
                setActiveId("button");
                setStatus("Restored files from Trash.");
              }}
            >
              <RotateCcw aria-hidden="true" />
              Restore from Trash
            </Button>
          </div>
        ) : (
          renderLevel(null, 0)
        )}
      </nav>
      <footer className="border-t border-sidebar-border px-3 py-2 font-mono text-[11px] text-muted-foreground">
        <p className="truncate">{activePath || "No file open"}</p>
        <p aria-live="polite" className="truncate font-sans">
          {status || "Right-click a file or folder"}
        </p>
      </footer>
    </section>
  );
}
