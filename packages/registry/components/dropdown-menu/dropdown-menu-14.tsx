"use client";

import * as React from "react";
import {
  Check,
  ChevronDown,
  Code2,
  Copy,
  FileArchive,
  GitBranch,
  Laptop,
  Terminal,
} from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";

const protocols = [
  { value: "https", label: "HTTPS", command: "https://git.forgebase.dev/acme/ledger-api.git" },
  { value: "ssh", label: "SSH", command: "git@git.forgebase.dev:acme/ledger-api.git" },
  { value: "cli", label: "Forge CLI", command: "forge repo clone acme/ledger-api" },
] as const;

type Protocol = (typeof protocols)[number]["value"];

export default function DropdownMenu14() {
  const [protocol, setProtocol] = React.useState<Protocol>("https");
  const [copied, setCopied] = React.useState(false);
  const current = protocols.find((p) => p.value === protocol) ?? protocols[0];

  React.useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const copy = () => {
    navigator.clipboard?.writeText(current.command).catch(() => {});
    setCopied(true);
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card text-card-foreground shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <Badge variant="outline" className="gap-1 font-mono">
            <GitBranch aria-hidden="true" />
            <span className="sr-only">Branch </span>
            main
          </Badge>
          <span className="truncate text-xs text-muted-foreground">
            14 branches · 32 tags
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button size="sm">
                <Code2 aria-hidden="true" data-icon="inline-start" />
                Code
                <ChevronDown aria-hidden="true" data-icon="inline-end" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-[min(20rem,calc(100vw-2rem))]">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-1.5">
                <Terminal aria-hidden="true" className="size-3.5" />
                Clone with
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={protocol}
                onValueChange={(value) => setProtocol(value as Protocol)}
                className="flex gap-1 px-1 pb-1"
              >
                {protocols.map((p) => (
                  <DropdownMenuRadioItem
                    key={p.value}
                    value={p.value}
                    className="flex-1 justify-center rounded-md px-2 text-xs data-checked:bg-muted data-checked:font-medium [&>[data-slot=dropdown-menu-radio-item-indicator]]:hidden"
                  >
                    {p.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
            <DropdownMenuItem
              closeOnClick={false}
              onClick={copy}
              label={`Copy ${current.label} clone command`}
              className="mx-0 my-1 gap-2 rounded-md border border-border bg-muted/40 py-1.5 font-mono text-xs"
            >
              <span className="min-w-0 flex-1 truncate">{current.command}</span>
              {copied ? (
                <Check aria-hidden="true" className="size-3.5 text-success" />
              ) : (
                <Copy aria-hidden="true" className="size-3.5 text-muted-foreground" />
              )}
              <span className="sr-only">
                {copied ? "Copied" : `Copy ${current.label} clone command`}
              </span>
            </DropdownMenuItem>
            <p aria-live="polite" className="px-1.5 pb-1 text-xs text-muted-foreground">
              {copied
                ? "Copied to clipboard."
                : protocol === "ssh"
                  ? "Uses the SSH key on your account."
                  : protocol === "cli"
                    ? "Requires Forge CLI 2.4 or newer."
                    : "Authenticate with a personal access token."}
            </p>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Laptop aria-hidden="true" />
              Open in Forge Desktop
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Code2 aria-hidden="true" />
              Open in web editor
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileArchive aria-hidden="true" />
              Download ZIP
              <Badge variant="outline" className="ml-auto">
                4.2 MB
              </Badge>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ul className="divide-y divide-border border-t border-border text-sm">
        <li className="flex items-center justify-between gap-3 px-3 py-2">
          <span className="truncate">src/routes/invoices.ts</span>
          <span className="shrink-0 text-xs text-muted-foreground">2 hours ago</span>
        </li>
        <li className="flex items-center justify-between gap-3 px-3 py-2">
          <span className="truncate">migrations/0042_add_tax_rates.sql</span>
          <span className="shrink-0 text-xs text-muted-foreground">yesterday</span>
        </li>
      </ul>
    </div>
  );
}
