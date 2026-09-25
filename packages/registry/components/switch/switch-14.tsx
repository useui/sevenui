"use client";

import { FlagIcon, SearchIcon, TriangleAlertIcon } from "lucide-react";
import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/registry/base/ui/alert-dialog";
import { Badge } from "@/registry/base/ui/badge";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/base/ui/input-group";
import { Switch } from "@/registry/base/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/registry/base/ui/tabs";

type Environment = "production" | "staging" | "development";

const environments: { id: Environment; label: string }[] = [
  { id: "production", label: "Production" },
  { id: "staging", label: "Staging" },
  { id: "development", label: "Development" },
];

const flags = [
  {
    key: "new-checkout-flow",
    description: "Single-page checkout with saved payment methods.",
    owner: "Payments",
    updated: "2h ago",
  },
  {
    key: "ai-reply-suggestions",
    description: "Suggest replies in the support inbox composer.",
    owner: "Support",
    updated: "Yesterday",
  },
  {
    key: "usage-based-billing",
    description: "Meter API calls and bill overages at month end.",
    owner: "Billing",
    updated: "3 days ago",
  },
  {
    key: "dark-mode-emails",
    description: "Send transactional emails with a dark color scheme.",
    owner: "Growth",
    updated: "Sep 12",
  },
  {
    key: "legacy-export-api",
    description: "Keep the v1 CSV export endpoint available.",
    owner: "Platform",
    updated: "Aug 30",
  },
];

type FlagKey = (typeof flags)[number]["key"];

const initialState: Record<Environment, Record<FlagKey, boolean>> = {
  production: {
    "new-checkout-flow": true,
    "ai-reply-suggestions": false,
    "usage-based-billing": true,
    "dark-mode-emails": false,
    "legacy-export-api": true,
  },
  staging: {
    "new-checkout-flow": true,
    "ai-reply-suggestions": true,
    "usage-based-billing": true,
    "dark-mode-emails": true,
    "legacy-export-api": true,
  },
  development: {
    "new-checkout-flow": true,
    "ai-reply-suggestions": true,
    "usage-based-billing": true,
    "dark-mode-emails": true,
    "legacy-export-api": false,
  },
};

export default function Switch14() {
  const [environment, setEnvironment] = React.useState<Environment>("production");
  const [state, setState] = React.useState(initialState);
  const [query, setQuery] = React.useState("");
  const [pendingOff, setPendingOff] = React.useState<FlagKey | null>(null);
  // Keeps the flag name in the dialog while it animates out after pendingOff clears.
  const [dialogFlag, setDialogFlag] = React.useState<FlagKey | null>(null);

  const current = state[environment];
  const normalized = query.trim().toLowerCase();
  const visible = flags.filter(
    (flag) =>
      flag.key.includes(normalized) ||
      flag.description.toLowerCase().includes(normalized) ||
      flag.owner.toLowerCase().includes(normalized),
  );
  const enabledCount = flags.filter((flag) => current[flag.key]).length;

  function setFlag(key: FlagKey, checked: boolean) {
    setState((previous) => ({
      ...previous,
      [environment]: { ...previous[environment], [key]: checked },
    }));
  }

  function handleChange(key: FlagKey, checked: boolean) {
    // Turning a flag off in production affects live traffic, so confirm first.
    if (environment === "production" && !checked) {
      setPendingOff(key);
      setDialogFlag(key);
      return;
    }
    setFlag(key, checked);
  }

  return (
    <section
      aria-labelledby="switch-14-title"
      className="w-full max-w-xl rounded-xl border border-border bg-card text-card-foreground"
    >
      <div className="flex flex-col gap-3 border-b border-border p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 id="switch-14-title" className="flex items-center gap-2 font-medium">
            <FlagIcon aria-hidden="true" className="size-4 text-muted-foreground" />
            Feature flags
          </h3>
          <span className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
            {enabledCount} of {flags.length} on
          </span>
        </div>
        <Tabs
          value={environment}
          onValueChange={(value) => setEnvironment(value as Environment)}
        >
          <TabsList className="w-full">
            {environments.map((env) => (
              <TabsTrigger key={env.id} value={env.id} className="min-w-0 text-xs sm:text-sm">
                {env.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            aria-label="Filter flags"
            placeholder="Filter by key, owner, or description"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </InputGroup>
      </div>

      {visible.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          No flags match “{query.trim()}”.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {visible.map((flag) => {
            const on = current[flag.key];
            const id = `switch-14-${flag.key}`;

            return (
              <li key={flag.key} className="flex items-start justify-between gap-4 px-4 py-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <label
                    htmlFor={id}
                    className="cursor-pointer font-mono break-all text-sm font-medium"
                  >
                    {flag.key}
                  </label>
                  <p id={`${id}-description`} className="text-xs text-muted-foreground">
                    {flag.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <Badge variant="outline">{flag.owner}</Badge>
                    <span>Updated {flag.updated}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 pt-0.5">
                  <span
                    aria-hidden="true"
                    className={on ? "text-xs font-medium" : "text-xs text-muted-foreground"}
                  >
                    {on ? "On" : "Off"}
                  </span>
                  <Switch
                    id={id}
                    checked={on}
                    aria-describedby={`${id}-description`}
                    onCheckedChange={(checked) => handleChange(flag.key, checked)}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AlertDialog
        open={pendingOff !== null}
        onOpenChange={(open) => {
          if (!open) setPendingOff(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <TriangleAlertIcon aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>Turn off in production?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-mono text-foreground">{dialogFlag}</span> will stop serving
              to all production users within 30 seconds.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it on</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (pendingOff) setFlag(pendingOff, false);
                setPendingOff(null);
              }}
            >
              Turn off
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
