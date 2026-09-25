"use client";

import * as React from "react";
import {
  Archive,
  Inbox,
  MailOpen,
  Paperclip,
  Reply,
  Star,
  Trash2,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/registry/base/ui/menubar";

const folders = ["Inbox", "Invoices", "Vendors", "Archive"];
const labels = ["Finance", "Urgent", "Follow up"];

const triggerClass = "focus-visible:ring-2 focus-visible:ring-ring/50";

export default function Menubar11() {
  const [folder, setFolder] = React.useState("Inbox");
  const [unread, setUnread] = React.useState(false);
  const [starred, setStarred] = React.useState(false);
  const [applied, setApplied] = React.useState<string[]>(["Finance"]);

  function toggleLabel(label: string, checked: boolean) {
    setApplied((current) =>
      checked ? [...current, label] : current.filter((item) => item !== label),
    );
  }

  return (
    <article
      aria-labelledby="menubar-11-subject"
      className="w-full max-w-lg rounded-xl border bg-card text-card-foreground"
    >
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <Menubar aria-label="Message actions">
          <MenubarMenu>
            <MenubarTrigger className={triggerClass}>Message</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                <Reply aria-hidden="true" />
                Reply
                <MenubarShortcut>R</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={() => setUnread((value) => !value)}>
                <MailOpen aria-hidden="true" />
                {unread ? "Mark as read" : "Mark as unread"}
                <MenubarShortcut>U</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={() => setStarred((value) => !value)}>
                <Star aria-hidden="true" />
                {starred ? "Remove star" : "Star message"}
                <MenubarShortcut>S</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem
                variant="destructive"
                onClick={() => setFolder("Trash")}
              >
                <Trash2 aria-hidden="true" />
                Move to trash
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className={triggerClass}>Organize</MenubarTrigger>
            <MenubarContent>
              <MenubarSub>
                <MenubarSubTrigger>
                  <Inbox aria-hidden="true" />
                  Move to
                </MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarRadioGroup value={folder} onValueChange={setFolder}>
                    {folders.map((name) => (
                      <MenubarRadioItem key={name} value={name}>
                        {name}
                      </MenubarRadioItem>
                    ))}
                  </MenubarRadioGroup>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSub>
                <MenubarSubTrigger>Labels</MenubarSubTrigger>
                <MenubarSubContent>
                  {labels.map((label) => (
                    <MenubarCheckboxItem
                      key={label}
                      checked={applied.includes(label)}
                      onCheckedChange={(checked) => toggleLabel(label, checked)}
                    >
                      {label}
                    </MenubarCheckboxItem>
                  ))}
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSeparator />
              <MenubarItem onClick={() => setFolder("Archive")}>
                <Archive aria-hidden="true" />
                Archive
                <MenubarShortcut>E</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {starred ? (
            <>
              <Star
                className="size-3.5 fill-current text-warning"
                aria-hidden="true"
              />
              <span className="sr-only">Starred,</span>
            </>
          ) : null}
          {folder}
        </span>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarFallback>NP</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="truncate text-sm font-medium">Nora Patel</p>
              <time
                dateTime="2026-09-24T09:12"
                className="shrink-0 text-xs text-muted-foreground"
              >
                9:12 AM
              </time>
            </div>
            <h3
              id="menubar-11-subject"
              className={
                unread ? "text-sm font-semibold" : "text-sm text-muted-foreground"
              }
            >
              Invoice INV-4821 is due on October 1
            </h3>
          </div>
        </div>

        {applied.length > 0 ? (
          <ul aria-label="Labels" className="flex flex-wrap gap-1.5">
            {applied.map((label) => (
              <li key={label}>
                <Badge variant={label === "Urgent" ? "destructive" : "secondary"}>
                  {label}
                </Badge>
              </li>
            ))}
          </ul>
        ) : null}

        <p className="text-sm leading-relaxed">
          Hi Daniel, attached is the September invoice for the Northwind
          hosting contract. Payment by bank transfer is preferred; reply here if
          your finance team needs a PO number on it.
        </p>

        <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <Paperclip
            className="size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 truncate">invoice-4821.pdf</span>
          <span className="text-xs text-muted-foreground">184 KB</span>
        </div>
      </div>
    </article>
  );
}
