"use client";

import { CalendarIcon, EllipsisIcon, PlusIcon } from "lucide-react";
import * as React from "react";
import type { Kit } from "./kit";

// The home page's live product surface: a release planner for a made-up team, composed only of SevenUI
// primitives. It is written once and handed a primitive set (`Kit`), so the Base UI and UI SDK renders run
// this exact code. Dates are fixed, never `new Date()`, so the server and the browser render the same thing.

type EnvId = "production" | "preview" | "staging";
type Status = "scheduled" | "shipped" | "rolled-back";
type Owner = { value: string; label: string; initials: string };
type Release = { id: string; version: string; title: string; env: EnvId; date: Date; owner: string; status: Status };

const OWNERS: Owner[] = [
  { value: "maya", label: "Maya Rivera", initials: "MR" },
  { value: "jon", label: "Jon Park", initials: "JP" },
  { value: "ana", label: "Ana Silva", initials: "AS" },
  { value: "leo", label: "Leo Brandt", initials: "LB" },
];

const ENVS: { value: EnvId; label: string }[] = [
  { value: "production", label: "Production" },
  { value: "preview", label: "Preview" },
  { value: "staging", label: "Staging" },
];
const ENV_FILTERS = [{ value: "all", label: "All environments" }, ...ENVS];
const ENV_LABEL = Object.fromEntries(ENVS.map((env) => [env.value, env.label])) as Record<EnvId, string>;

/** "Today" in the demo. */
const TODAY = new Date(2026, 10, 13);

const SEED: Release[] = [
  { id: "r5", version: "v4.3.0", title: "Saved carts", env: "staging", date: new Date(2026, 10, 18), owner: "ana", status: "scheduled" },
  { id: "r4", version: "v4.2.1", title: "Fix tax rounding on refunds", env: "production", date: new Date(2026, 10, 12), owner: "jon", status: "shipped" },
  { id: "r3", version: "v4.2.0", title: "Checkout redesign", env: "production", date: new Date(2026, 10, 10), owner: "maya", status: "shipped" },
  { id: "r2", version: "v4.2.0-rc.1", title: "Checkout redesign, candidate", env: "preview", date: new Date(2026, 10, 6), owner: "maya", status: "shipped" },
  { id: "r1", version: "v4.1.3", title: "Search ranking tweaks", env: "production", date: new Date(2026, 10, 3), owner: "leo", status: "rolled-back" },
];

const STATUS: Record<Status, { label: string; variant: "outline" | "success" | "warning" }> = {
  scheduled: { label: "Scheduled", variant: "outline" },
  shipped: { label: "Shipped", variant: "success" },
  "rolled-back": { label: "Rolled back", variant: "warning" },
};

const shortDate = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
const longDate = (date: Date) => date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
const ownerOf = (value: string) => OWNERS.find((owner) => owner.value === value) ?? OWNERS[0];

export function createReleasesApp(ui: Kit) {
  function ReleaseRow({
    release,
    onPromote,
    onRollBack,
  }: {
    release: Release;
    onPromote: () => void;
    onRollBack: () => void;
  }) {
    const owner = ownerOf(release.owner);
    const status = STATUS[release.status];
    return (
      <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 border-b border-hairline px-4 py-3 last:border-b-0 sm:grid-cols-[6.5rem_minmax(0,1fr)_6.5rem_3.75rem_8.25rem_auto] sm:px-5">
        <span className="font-mono text-xs text-muted-foreground sm:text-[0.8125rem] sm:text-foreground">{release.version}</span>
        <span className="row-start-2 min-w-0 truncate text-sm font-medium sm:row-start-auto">{release.title}</span>
        <span className="hidden text-[0.8125rem] text-muted-foreground sm:block">{ENV_LABEL[release.env]}</span>
        <span className="hidden text-[0.8125rem] text-muted-foreground tabular-nums sm:block">{shortDate(release.date)}</span>
        <span className="col-start-2 row-start-1 flex items-center justify-end gap-2 sm:col-start-auto sm:row-start-auto sm:justify-start">
          <ui.Avatar size="sm">
            <ui.AvatarFallback className="text-[0.625rem] text-foreground">{owner.initials}</ui.AvatarFallback>
          </ui.Avatar>
          <ui.Badge variant={status.variant}>{status.label}</ui.Badge>
          <span className="sr-only">, owner {owner.label}</span>
        </span>
        <span className="col-start-2 row-start-2 flex justify-end sm:col-start-auto sm:row-start-auto">
          <ui.DropdownMenu>
            <ui.DropdownMenuTrigger
              render={<ui.Button aria-label={`Actions for ${release.version}`} size="icon-sm" variant="ghost" />}
            >
              <EllipsisIcon aria-hidden="true" />
            </ui.DropdownMenuTrigger>
            <ui.DropdownMenuContent align="end" className="w-48">
              <ui.DropdownMenuGroup>
                <ui.DropdownMenuLabel>{release.version}</ui.DropdownMenuLabel>
                <ui.DropdownMenuItem disabled={release.env === "production"} onClick={onPromote}>
                  Promote to production
                </ui.DropdownMenuItem>
              </ui.DropdownMenuGroup>
              <ui.DropdownMenuSeparator />
              <ui.DropdownMenuItem disabled={release.status !== "shipped"} onClick={onRollBack} variant="destructive">
                Roll back
              </ui.DropdownMenuItem>
            </ui.DropdownMenuContent>
          </ui.DropdownMenu>
        </span>
      </li>
    );
  }

  function NewReleaseDialog({ onCreate }: { onCreate: (release: Release) => void }) {
    const id = React.useId();
    const [open, setOpen] = React.useState(false);
    const [env, setEnv] = React.useState<EnvId>("staging");
    const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 10, 20));
    const [dateOpen, setDateOpen] = React.useState(false);
    const [notify, setNotify] = React.useState(true);

    return (
      <ui.Dialog onOpenChange={setOpen} open={open}>
        <ui.DialogTrigger render={<ui.Button size="sm" />}>
          <PlusIcon aria-hidden="true" data-icon="inline-start" />
          New release
        </ui.DialogTrigger>
        <ui.DialogContent className="sm:max-w-md">
          <form
            className="contents"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const version = String(data.get("version") || "v4.4.0").trim();
              const title = String(data.get("title") || "Untitled release").trim();
              const day = date ?? TODAY;
              onCreate({ id: `${version}-${day.getTime()}`, version, title, env, date: day, owner: "maya", status: "scheduled" });
              setOpen(false);
              ui.toast.add({
                title: `${version} scheduled`,
                description: `${ENV_LABEL[env]}, ${longDate(day)}${notify ? ". The team will be notified." : "."}`,
              });
            }}
          >
            <ui.DialogHeader>
              <ui.DialogTitle>New release</ui.DialogTitle>
              <ui.DialogDescription>Schedule a release for one environment. Nothing leaves this page.</ui.DialogDescription>
            </ui.DialogHeader>
            <ui.FieldGroup className="gap-4">
              <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3">
                <ui.Field>
                  <ui.FieldLabel htmlFor={`${id}-version`}>Version</ui.FieldLabel>
                  <ui.Input className="font-mono" defaultValue="v4.4.0" id={`${id}-version`} name="version" />
                </ui.Field>
                <ui.Field>
                  <ui.FieldLabel htmlFor={`${id}-title`}>Title</ui.FieldLabel>
                  <ui.Input defaultValue="Gift cards" id={`${id}-title`} name="title" />
                </ui.Field>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ui.Field>
                  <ui.FieldLabel htmlFor={`${id}-env`}>Environment</ui.FieldLabel>
                  {/* A wrapper keeps the popup from being a direct child of Field: UI SDK renders popups in place
                      (top layer, no portal), and Field's `*:w-full` would stretch them to the viewport. */}
                  <div>
                    <ui.Select items={ENVS} onValueChange={(value) => value && setEnv(value as EnvId)} value={env}>
                      <ui.SelectTrigger className="w-full" id={`${id}-env`}>
                        <ui.SelectValue />
                      </ui.SelectTrigger>
                      <ui.SelectContent>
                        {ENVS.map((item) => (
                          <ui.SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </ui.SelectItem>
                        ))}
                      </ui.SelectContent>
                    </ui.Select>
                  </div>
                </ui.Field>
                <ui.Field>
                  <ui.FieldLabel htmlFor={`${id}-date`}>Ship date</ui.FieldLabel>
                  <div>
                    <ui.Popover onOpenChange={setDateOpen} open={dateOpen}>
                      <ui.PopoverTrigger
                        render={
                          <ui.Button className="w-full justify-start font-normal" id={`${id}-date`} variant="outline" />
                        }
                      >
                        <CalendarIcon aria-hidden="true" data-icon="inline-start" />
                        {date ? longDate(date) : "Pick a day"}
                      </ui.PopoverTrigger>
                      <ui.PopoverContent align="start" className="w-auto p-0">
                        <React.Suspense fallback={<div aria-hidden="true" className="h-[18.5rem] w-[15.75rem]" />}>
                          <ui.Calendar
                            defaultMonth={TODAY}
                            disabled={{ before: TODAY }}
                            mode="single"
                            onSelect={(day: Date | undefined) => {
                              setDate(day);
                              if (day) setDateOpen(false);
                            }}
                            selected={date}
                          />
                        </React.Suspense>
                      </ui.PopoverContent>
                    </ui.Popover>
                  </div>
                </ui.Field>
              </div>
              <ui.Field className="items-center justify-between gap-4 rounded-lg border border-hairline px-3 py-2.5" orientation="horizontal">
                <ui.FieldLabel className="font-normal" htmlFor={`${id}-notify`}>
                  Notify the team in #releases
                </ui.FieldLabel>
                <ui.Switch checked={notify} id={`${id}-notify`} onCheckedChange={setNotify} />
              </ui.Field>
            </ui.FieldGroup>
            <ui.DialogFooter>
              <ui.DialogClose render={<ui.Button variant="outline" />}>Cancel</ui.DialogClose>
              <ui.Button type="submit">Schedule release</ui.Button>
            </ui.DialogFooter>
          </form>
        </ui.DialogContent>
      </ui.Dialog>
    );
  }

  const ENVIRONMENTS = [
    { id: "production", label: "Production", url: "acme.shop", auto: false },
    { id: "staging", label: "Staging", url: "staging.acme.shop", auto: true },
    { id: "preview", label: "Preview", url: "pr-*.acme.shop", auto: true },
  ];

  function Environments() {
    const id = React.useId();
    return (
      <ul className="flex flex-col">
        {ENVIRONMENTS.map((env) => (
          <li
            className="flex items-center justify-between gap-4 border-b border-hairline px-4 py-3.5 last:border-b-0 sm:px-5"
            key={env.id}
          >
            <span className="min-w-0">
              <span className="block text-sm font-medium">{env.label}</span>
              <span className="block truncate font-mono text-xs text-muted-foreground">{env.url}</span>
            </span>
            <span className="flex shrink-0 items-center gap-2.5">
              <label className="text-[0.8125rem] text-muted-foreground" htmlFor={`${id}-${env.id}`}>
                Deploy on merge
              </label>
              <ui.Switch defaultChecked={env.auto} id={`${id}-${env.id}`} />
            </span>
          </li>
        ))}
      </ul>
    );
  }

  return function ReleasesApp() {
    const id = React.useId();
    const [releases, setReleases] = React.useState(SEED);
    const [owner, setOwner] = React.useState<Owner | null>(null);
    const [env, setEnv] = React.useState<string>("all");

    const shown = releases.filter(
      (release) => (!owner || release.owner === owner.value) && (env === "all" || release.env === env),
    );
    const update = (target: Release, patch: Partial<Release>) =>
      setReleases((list) => list.map((release) => (release.id === target.id ? { ...release, ...patch } : release)));

    return (
      <div className="w-full text-left text-sm text-foreground">
        <ui.Toaster />
        <ui.Tabs defaultValue="releases">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-4 py-3 sm:px-5">
            <ui.TabsList aria-label="Release planner">
              <ui.TabsTrigger value="releases">Releases</ui.TabsTrigger>
              <ui.TabsTrigger value="environments">Environments</ui.TabsTrigger>
            </ui.TabsList>
            <NewReleaseDialog onCreate={(release) => setReleases((list) => [release, ...list])} />
          </div>

          <ui.TabsContent value="releases">
            <div className="flex flex-wrap items-center gap-2 border-b border-hairline px-4 py-3 sm:px-5">
              <ui.Combobox items={OWNERS} onValueChange={(value) => setOwner(value as Owner | null)} value={owner}>
                <ui.ComboboxInput aria-label="Filter by owner" className="w-full sm:w-44" placeholder="Any owner" showClear />
                <ui.ComboboxContent>
                  <ui.ComboboxEmpty>No one by that name.</ui.ComboboxEmpty>
                  <ui.ComboboxList>
                    {(item: Owner) => (
                      <ui.ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ui.ComboboxItem>
                    )}
                  </ui.ComboboxList>
                </ui.ComboboxContent>
              </ui.Combobox>
              <ui.Select items={ENV_FILTERS} onValueChange={(value) => setEnv(String(value ?? "all"))} value={env}>
                <ui.SelectTrigger aria-label="Filter by environment" className="w-full sm:w-44">
                  <ui.SelectValue />
                </ui.SelectTrigger>
                <ui.SelectContent>
                  {ENV_FILTERS.map((item) => (
                    <ui.SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </ui.SelectItem>
                  ))}
                </ui.SelectContent>
              </ui.Select>
              <span aria-live="polite" className="ml-auto text-xs text-muted-foreground tabular-nums" id={`${id}-count`}>
                {shown.length === 1 ? "1 release" : `${shown.length} releases`}
              </span>
            </div>
            {shown.length > 0 ? (
              <ul aria-labelledby={`${id}-count`} className="flex flex-col">
                {shown.map((release) => (
                  <ReleaseRow
                    key={release.id}
                    onPromote={() => {
                      update(release, { env: "production" });
                      ui.toast.add({ title: `${release.version} promoted`, description: "Production now runs this release." });
                    }}
                    onRollBack={() => {
                      update(release, { status: "rolled-back" });
                      ui.toast.add({ title: `${release.version} rolled back`, type: "warning" });
                    }}
                    release={release}
                  />
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
                <p className="text-sm text-muted-foreground">No releases match these filters.</p>
                <ui.Button
                  onClick={() => {
                    setOwner(null);
                    setEnv("all");
                  }}
                  size="sm"
                  variant="outline"
                >
                  Clear filters
                </ui.Button>
              </div>
            )}
          </ui.TabsContent>

          <ui.TabsContent value="environments">
            <Environments />
          </ui.TabsContent>
        </ui.Tabs>
      </div>
    );
  };
}
