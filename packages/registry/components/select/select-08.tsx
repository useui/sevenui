"use client";

import { Lock, RotateCw } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";
import { Spinner } from "@/registry/base/ui/spinner";

const languages = [
  { value: "en-US", label: "English (United States)" },
  { value: "de-DE", label: "German (Germany)" },
  { value: "tr-TR", label: "Turkish (Turkey)" },
];

const currencies = [
  { value: "usd", label: "US Dollar (USD)" },
  { value: "eur", label: "Euro (EUR)" },
];

const channels = [
  { value: "deploys", label: "#deploys" },
  { value: "eng-oncall", label: "#eng-oncall" },
  { value: "billing-alerts", label: "#billing-alerts" },
];

export default function Select08() {
  const [loading, setLoading] = React.useState(true);
  const [attempt, setAttempt] = React.useState(0);

  // Simulates fetching the Slack channel list; re-runs whenever "Refresh" is pressed.
  // biome-ignore lint/correctness/useExhaustiveDependencies: attempt re-triggers the fetch
  React.useEffect(() => {
    setLoading(true);
    const timeout = window.setTimeout(() => setLoading(false), 1400);
    return () => window.clearTimeout(timeout);
  }, [attempt]);

  return (
    <div className="grid w-full max-w-xs gap-5">
      <div className="grid gap-1.5">
        <Label htmlFor="select-08-language">Workspace language</Label>
        <Select items={languages} defaultValue="en-US" readOnly>
          <SelectTrigger
            id="select-08-language"
            className="w-full bg-muted/50 data-readonly:cursor-default dark:bg-muted/50 dark:hover:bg-muted/50"
            aria-describedby="select-08-language-hint"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((language) => (
              <SelectItem key={language.value} value={language.value}>
                {language.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p
          id="select-08-language-hint"
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Lock className="size-3 shrink-0" aria-hidden="true" />
          Read-only: set by your organization admin.
        </p>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="select-08-currency">Billing currency</Label>
        <Select items={currencies} defaultValue="usd" disabled>
          <SelectTrigger
            id="select-08-currency"
            className="w-full"
            aria-describedby="select-08-currency-hint"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((currency) => (
              <SelectItem key={currency.value} value={currency.value}>
                {currency.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p id="select-08-currency-hint" className="text-xs text-muted-foreground">
          Disabled: currency is locked after the first invoice.
        </p>
      </div>

      <div className="grid gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="select-08-channel">Alert channel</Label>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setAttempt((count) => count + 1)}
            disabled={loading}
          >
            <RotateCw aria-hidden="true" />
            Refresh
          </Button>
        </div>
        <Select items={channels} defaultValue="deploys" disabled={loading}>
          <SelectTrigger
            id="select-08-channel"
            className="w-full"
            aria-busy={loading}
            aria-describedby="select-08-channel-hint"
          >
            {loading ? (
              <span className="flex flex-1 items-center gap-2 text-muted-foreground">
                <Spinner aria-hidden="true" role="presentation" />
                Fetching channels…
              </span>
            ) : (
              <SelectValue />
            )}
          </SelectTrigger>
          <SelectContent>
            {channels.map((channel) => (
              <SelectItem key={channel.value} value={channel.value}>
                {channel.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p
          id="select-08-channel-hint"
          aria-live="polite"
          className="text-xs text-muted-foreground"
        >
          {loading
            ? "Loading: syncing with your Slack workspace."
            : "3 channels synced from the Northwind Slack workspace."}
        </p>
      </div>
    </div>
  );
}
