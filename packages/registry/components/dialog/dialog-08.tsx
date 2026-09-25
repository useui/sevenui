"use client";

import * as React from "react";
import { Bell, Settings2, Users } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/base/ui/dialog";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

const sections = [
  { value: "general", label: "General", icon: Settings2 },
  { value: "notifications", label: "Notifications", icon: Bell },
  { value: "members", label: "Members", icon: Users },
];

const notifications = [
  {
    id: "mentions",
    label: "Mentions",
    hint: "When someone @mentions you in a comment.",
    defaultChecked: true,
  },
  {
    id: "deploys",
    label: "Failed deploys",
    hint: "When a production deploy fails or rolls back.",
    defaultChecked: true,
  },
  {
    id: "digest",
    label: "Weekly digest",
    hint: "A Monday summary of activity across projects.",
    defaultChecked: false,
  },
];

const members = [
  { name: "Maya Chen", email: "maya@acme.co", role: "Owner" },
  { name: "Jonas Weber", email: "jonas@acme.co", role: "Admin" },
  { name: "Priya Raman", email: "priya@acme.co", role: "Member" },
];

type Settings = {
  name: string;
  timezone: string;
  notify: Record<string, boolean>;
};

const initialSettings: Settings = {
  name: "Acme Design",
  timezone: "Europe/Berlin (UTC+02:00)",
  notify: Object.fromEntries(
    notifications.map((item) => [item.id, item.defaultChecked]),
  ),
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export default function Dialog08() {
  const [saved, setSaved] = React.useState(initialSettings);
  // Edits live in a draft until "Save changes"; Cancel throws them away.
  const [draft, setDraft] = React.useState(initialSettings);

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) setDraft(saved);
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline">
            <Settings2 aria-hidden="true" data-icon="inline-start" />
            Workspace settings
          </Button>
        }
      />
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-4 py-3.5 pr-12">
          <DialogTitle>Workspace settings</DialogTitle>
          <DialogDescription>{saved.name} · Pro plan</DialogDescription>
        </DialogHeader>
        <Tabs
          defaultValue="general"
          orientation="vertical"
          className="flex-col gap-0 sm:flex-row"
        >
          <TabsList
            variant="line"
            className="h-auto! w-full shrink-0 flex-row! gap-1 overflow-x-auto border-b bg-muted/40 p-2 sm:w-48 sm:flex-col! sm:items-stretch sm:justify-start sm:border-r sm:border-b-0"
          >
            {sections.map((section) => (
              <TabsTrigger
                key={section.value}
                value={section.value}
                className="h-8 w-auto! flex-none justify-start px-2 after:hidden data-active:bg-background! data-active:shadow-sm! sm:w-full!"
              >
                <section.icon aria-hidden="true" />
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="min-h-72 min-w-0 flex-1 p-4">
            <TabsContent value="general" className="grid content-start gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dialog-08-name">Workspace name</Label>
                <Input
                  id="dialog-08-name"
                  value={draft.name}
                  onChange={(event) =>
                    setDraft({ ...draft, name: event.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dialog-08-timezone">Default time zone</Label>
                <Input
                  id="dialog-08-timezone"
                  value={draft.timezone}
                  onChange={(event) =>
                    setDraft({ ...draft, timezone: event.target.value })
                  }
                />
              </div>
              <p className="text-muted-foreground">
                Due dates and reports use this time zone unless a member sets
                their own.
              </p>
            </TabsContent>
            <TabsContent value="notifications" className="grid content-start">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 border-b py-3 first:pt-0 last:border-b-0"
                >
                  <div className="grid gap-0.5">
                    <Label htmlFor={`dialog-08-${item.id}`}>{item.label}</Label>
                    <p className="text-muted-foreground">{item.hint}</p>
                  </div>
                  <Switch
                    id={`dialog-08-${item.id}`}
                    checked={draft.notify[item.id]}
                    onCheckedChange={(checked) =>
                      setDraft({
                        ...draft,
                        notify: { ...draft.notify, [item.id]: checked },
                      })
                    }
                    className="mt-0.5"
                  />
                </div>
              ))}
            </TabsContent>
            <TabsContent value="members" className="grid content-start gap-3">
              <ul className="grid gap-3">
                {members.map((member) => (
                  <li key={member.email} className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{initials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div className="grid min-w-0 flex-1">
                      <span className="truncate font-medium">
                        {member.name}
                      </span>
                      <span className="truncate text-muted-foreground">
                        {member.email}
                      </span>
                    </div>
                    <Badge
                      variant={member.role === "Owner" ? "secondary" : "outline"}
                    >
                      {member.role}
                    </Badge>
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground">3 of 10 seats used.</p>
            </TabsContent>
          </div>
        </Tabs>
        <DialogFooter className="m-0">
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <DialogClose
            render={
              <Button
                onClick={() =>
                  setSaved({ ...draft, name: draft.name.trim() || saved.name })
                }
              >
                Save changes
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
