"use client";

import * as React from "react";
import {
  ArchiveIcon,
  FileTextIcon,
  InboxIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SendIcon,
  Trash2Icon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  SidebarInput,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/registry/base/ui/sidebar";

const mailboxes = [
  { id: "inbox", title: "Inbox", icon: InboxIcon, unread: 24 },
  { id: "drafts", title: "Drafts", icon: FileTextIcon, unread: 3 },
  { id: "sent", title: "Sent", icon: SendIcon, unread: 0 },
  { id: "archive", title: "Archive", icon: ArchiveIcon, unread: 0 },
];

const initialLabels = [
  { id: "clients", title: "Clients", dot: "bg-chart-1", unread: 7 },
  { id: "invoices", title: "Invoices", dot: "bg-chart-2", unread: 2 },
  { id: "hiring", title: "Hiring", dot: "bg-chart-3", unread: 0 },
];

const dots = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];

export default function Sidebar04() {
  const [active, setActive] = React.useState("inbox");
  const [labels, setLabels] = React.useState(initialLabels);
  const created = React.useRef(0);
  const [renamingId, setRenamingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const renamingRef = React.useRef<string | null>(null);
  renamingRef.current = renamingId;

  function startRename(id: string, title: string) {
    setDraft(title);
    renamingRef.current = id;
    setRenamingId(id);
  }

  function commitRename() {
    const title = draft.trim();
    if (renamingId && title) {
      setLabels((current) =>
        current.map((label) => (label.id === renamingId ? { ...label, title } : label)),
      );
    }
    setRenamingId(null);
  }

  function addLabel() {
    created.current += 1;
    const count = created.current;
    setLabels((current) => [
      ...current,
      {
        id: `new-label-${count}`,
        title: `New label ${count}`,
        dot: dots[(initialLabels.length + count - 1) % dots.length],
        unread: 0,
      },
    ]);
  }

  function removeLabel(id: string) {
    setLabels((current) => current.filter((label) => label.id !== id));
    if (active === id) setActive("inbox");
  }

  return (
    <SidebarProvider className="min-h-0 w-full max-w-64 overflow-hidden rounded-xl border border-sidebar-border">
      <Sidebar
        collapsible="none"
        role="navigation"
        aria-label="Mail"
        className="h-[26rem] w-full"
      >
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Mailboxes</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mailboxes.map((box) => (
                  <SidebarMenuItem key={box.id}>
                    <SidebarMenuButton
                      isActive={active === box.id}
                      aria-current={active === box.id ? "page" : undefined}
                      onClick={() => setActive(box.id)}
                    >
                      <box.icon aria-hidden="true" />
                      <span>{box.title}</span>
                    </SidebarMenuButton>
                    {box.unread > 0 ? (
                      <SidebarMenuBadge>
                        {box.unread}
                        <span className="sr-only"> unread</span>
                      </SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Labels</SidebarGroupLabel>
            <SidebarGroupAction title="Add label" onClick={addLabel}>
              <PlusIcon aria-hidden="true" />
              <span className="sr-only">Add label</span>
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                {labels.map((label) => (
                  <SidebarMenuItem key={label.id}>
                    {renamingId === label.id ? (
                      <form
                        onSubmit={(event) => {
                          event.preventDefault();
                          commitRename();
                        }}
                      >
                        <SidebarInput
                          autoFocus
                          aria-label={`Rename ${label.title}`}
                          value={draft}
                          onChange={(event) => setDraft(event.target.value)}
                          onFocus={(event) => event.currentTarget.select()}
                          onBlur={commitRename}
                          onKeyDown={(event) => {
                            if (event.key === "Escape") {
                              event.preventDefault();
                              setRenamingId(null);
                            }
                          }}
                        />
                      </form>
                    ) : (
                      <>
                        <SidebarMenuButton
                          isActive={active === label.id}
                          aria-current={active === label.id ? "page" : undefined}
                          onClick={() => setActive(label.id)}
                          className="pr-14"
                        >
                          <span
                            aria-hidden="true"
                            className={`mx-1 size-2 shrink-0 rounded-full ${label.dot}`}
                          />
                          <span>{label.title}</span>
                        </SidebarMenuButton>
                        {label.unread > 0 ? (
                          <SidebarMenuBadge className="right-7">
                            {label.unread}
                            <span className="sr-only"> unread</span>
                          </SidebarMenuBadge>
                        ) : null}
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<SidebarMenuAction showOnHover />}
                            aria-label={`More options for ${label.title}`}
                          >
                            <MoreHorizontalIcon aria-hidden="true" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            side="right"
                            align="start"
                            className="w-40"
                            // Rename moves focus into the inline field, so do not
                            // hand it back to the trigger on close.
                            finalFocus={() => renamingRef.current === null}
                          >
                            <DropdownMenuItem
                              onClick={() =>
                                setLabels((current) =>
                                  current.map((item) =>
                                    item.id === label.id ? { ...item, unread: 0 } : item,
                                  ),
                                )
                              }
                            >
                              <InboxIcon aria-hidden="true" />
                              Mark all as read
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => startRename(label.id, label.title)}>
                              <PencilIcon aria-hidden="true" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => removeLabel(label.id)}
                            >
                              <Trash2Icon aria-hidden="true" />
                              Delete label
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
