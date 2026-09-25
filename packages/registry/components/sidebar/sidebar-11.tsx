"use client";

import * as React from "react";
import {
  BellIcon,
  CreditCardIcon,
  KeyRoundIcon,
  PlugIcon,
  ShieldCheckIcon,
  UserIcon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/registry/base/ui/sidebar";
import { Switch } from "@/registry/base/ui/switch";

type Row =
  | { id: string; kind: "toggle"; label: string; hint: string; on: boolean }
  | { id: string; kind: "edit"; label: string; hint: string; cta: string }
  | { id: string; kind: "action"; label: string; hint: string; cta: string; result: string };

type Section = {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  group: "Account" | "Workspace";
  description: string;
  rows: Row[];
};

const sections: Section[] = [
  {
    id: "profile",
    label: "Profile",
    icon: UserIcon,
    group: "Account",
    description: "How you appear to teammates across Northwind.",
    rows: [
      { id: "name", kind: "edit", label: "Display name", hint: "Maya Lindqvist", cta: "Edit" },
      { id: "email", kind: "edit", label: "Email", hint: "maya@northwind.io", cta: "Change" },
      { id: "status", kind: "toggle", label: "Show online status", hint: "Teammates see a dot on your avatar.", on: true },
    ],
  },
  {
    id: "security",
    label: "Security",
    icon: ShieldCheckIcon,
    group: "Account",
    description: "Protect your account with a second factor and session control.",
    rows: [
      { id: "2fa", kind: "toggle", label: "Two-factor authentication", hint: "Require a code from your authenticator app.", on: true },
      { id: "passkey", kind: "action", label: "Passkeys", hint: "1 passkey on MacBook Pro", cta: "Add passkey", result: "2 passkeys, one added on this browser just now" },
      { id: "sessions", kind: "action", label: "Active sessions", hint: "3 devices signed in", cta: "Sign out all", result: "Only this device is signed in" },
    ],
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: BellIcon,
    group: "Account",
    description: "Choose which updates reach your inbox.",
    rows: [
      { id: "mentions", kind: "toggle", label: "Mentions and replies", hint: "Email me when someone @mentions me.", on: true },
      { id: "digest", kind: "toggle", label: "Weekly digest", hint: "A Monday summary of project activity.", on: false },
      { id: "product", kind: "toggle", label: "Product updates", hint: "New features, at most twice a month.", on: false },
    ],
  },
  {
    id: "billing",
    label: "Billing",
    icon: CreditCardIcon,
    group: "Workspace",
    description: "Team plan, billed yearly. Renews on March 14, 2027.",
    rows: [
      { id: "plan", kind: "action", label: "Team plan", hint: "12 of 15 seats used", cta: "Add seats", result: "12 of 20 seats used, 5 seats added" },
      { id: "card", kind: "action", label: "Payment method", hint: "Visa ending in 4242", cta: "Update", result: "Update link sent to billing@northwind.io" },
      { id: "invoices", kind: "toggle", label: "Email invoices", hint: "Send receipts to billing@northwind.io.", on: true },
    ],
  },
  {
    id: "api",
    label: "API keys",
    icon: KeyRoundIcon,
    group: "Workspace",
    description: "Keys authenticate server-to-server requests.",
    rows: [
      { id: "prod", kind: "action", label: "Production key", hint: "Created Aug 2, last used 4 minutes ago", cta: "Roll key", result: "Rolled just now, the old key works for 24 more hours" },
      { id: "test", kind: "action", label: "Test key", hint: "Created Jul 18, never used", cta: "Revoke", result: "Revoked just now" },
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: PlugIcon,
    group: "Workspace",
    description: "Connect the tools your team already uses.",
    rows: [
      { id: "slack", kind: "toggle", label: "Slack", hint: "Post deploy summaries to #releases.", on: true },
      { id: "github", kind: "toggle", label: "GitHub", hint: "Link pull requests to tasks.", on: true },
      { id: "linear", kind: "toggle", label: "Linear", hint: "Sync issues both ways.", on: false },
    ],
  },
];

const groups = ["Account", "Workspace"] as const;

export default function Sidebar11() {
  const [activeId, setActiveId] = React.useState("security");
  const [toggles, setToggles] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      sections.flatMap((section) =>
        section.rows
          .filter((row) => row.kind === "toggle")
          .map((row) => [`${section.id}.${row.id}`, row.kind === "toggle" && row.on]),
      ),
    ),
  );

  // Edited values and completed actions, keyed by "section.row".
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [done, setDone] = React.useState<Record<string, boolean>>({});
  const [editing, setEditing] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");

  const active = sections.find((section) => section.id === activeId) ?? sections[0];

  return (
    <div className="@container w-full max-w-3xl overflow-hidden rounded-xl border bg-background">
      <SidebarProvider className="min-h-0 flex-col @xl:h-[440px] @xl:flex-row">
        <Sidebar
          collapsible="none"
          role="navigation"
          aria-label="Settings"
          className="w-full border-b @xl:w-56 @xl:border-r @xl:border-b-0"
        >
          <SidebarHeader className="px-4 pt-4 pb-0 @xl:pb-2">
            <p className="text-sm font-semibold">Settings</p>
          </SidebarHeader>
          <SidebarContent className="flex-row overflow-x-auto @xl:flex-col @xl:overflow-x-hidden">
            {groups.map((group) => (
              <SidebarGroup key={group} className="w-auto shrink-0 @xl:w-full">
                <SidebarGroupLabel className="hidden @xl:flex">
                  {group}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu
                    aria-label={`${group} settings`}
                    className="flex-row gap-1 @xl:flex-col @xl:gap-0"
                  >
                    {sections
                      .filter((section) => section.group === group)
                      .map((section) => (
                        <SidebarMenuItem key={section.id} className="shrink-0">
                          <SidebarMenuButton
                            isActive={section.id === activeId}
                            aria-current={section.id === activeId ? "page" : undefined}
                            onClick={() => {
                              setActiveId(section.id);
                              setEditing(null);
                            }}
                          >
                            <section.icon aria-hidden="true" />
                            <span className="whitespace-nowrap">{section.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
        </Sidebar>
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <section aria-labelledby="sidebar-11-title" className="flex flex-col gap-1 p-4 @xl:p-6">
            <h2 id="sidebar-11-title" className="text-base font-semibold">
              {active.label}
            </h2>
            <p className="text-sm text-balance text-muted-foreground">
              {active.description}
            </p>
            <ul className="mt-4 divide-y rounded-lg border">
              {active.rows.map((row) => {
                const key = `${active.id}.${row.id}`;
                const labelId = `sidebar-11-${key.replace(".", "-")}`;
                return (
                  <li key={key} className="flex items-center justify-between gap-4 p-3">
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span id={labelId} className="text-sm font-medium">
                        {row.label}
                      </span>
                      {editing === key ? (
                        <form
                          className="mt-1 flex flex-wrap gap-2"
                          onSubmit={(event) => {
                            event.preventDefault();
                            if (draft.trim()) {
                              setValues((current) => ({ ...current, [key]: draft.trim() }));
                            }
                            setEditing(null);
                          }}
                        >
                          <Input
                            autoFocus
                            aria-labelledby={labelId}
                            type={row.id === "email" ? "email" : "text"}
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Escape") setEditing(null);
                            }}
                            className="h-8 w-56 max-w-full"
                          />
                          <Button type="submit" size="sm" disabled={!draft.trim()}>
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditing(null)}
                          >
                            Cancel
                          </Button>
                        </form>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {row.kind === "action" && done[key]
                            ? row.result
                            : (values[key] ?? row.hint)}
                        </span>
                      )}
                    </div>
                    {row.kind === "toggle" ? (
                      <Switch
                        aria-labelledby={labelId}
                        checked={toggles[key]}
                        onCheckedChange={(checked) =>
                          setToggles((current) => ({ ...current, [key]: checked }))
                        }
                      />
                    ) : row.kind === "edit" ? (
                      editing === key ? null : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                          aria-describedby={labelId}
                          onClick={() => {
                            setDraft(values[key] ?? row.hint);
                            setEditing(key);
                          }}
                        >
                          {row.cta}
                        </Button>
                      )
                    ) : (
                      <Button
                        variant={done[key] ? "ghost" : "outline"}
                        size="sm"
                        className="shrink-0"
                        aria-describedby={labelId}
                        onClick={() =>
                          setDone((current) => ({ ...current, [key]: !current[key] }))
                        }
                      >
                        {done[key] ? "Undo" : row.cta}
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </SidebarProvider>
    </div>
  );
}
