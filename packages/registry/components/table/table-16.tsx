"use client";

import { cn } from "cn";
import {
  CheckIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  PlusIcon,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";

type ApiKey = {
  id: string;
  name: string;
  secret: string;
  scope: "Full access" | "Read only";
  created: string;
  lastUsed: string;
  revoked?: boolean;
};

const initialKeys: ApiKey[] = [
  {
    id: "k1",
    name: "Production server",
    secret: "ak_live_51Hq8f2KxR7a9bD4mW0c",
    scope: "Full access",
    created: "Mar 3, 2026",
    lastUsed: "2 minutes ago",
  },
  {
    id: "k2",
    name: "Analytics export",
    secret: "ak_live_51Hq2pLz8vN3tYe6Qa1u",
    scope: "Read only",
    created: "Jun 17, 2026",
    lastUsed: "Yesterday",
  },
  {
    id: "k3",
    name: "Old staging",
    secret: "ak_test_4eC39HqLyjWDarjtT1zd",
    scope: "Full access",
    created: "Nov 9, 2025",
    lastUsed: "91 days ago",
    revoked: true,
  },
];

function mask(secret: string) {
  return `${secret.slice(0, 8)}••••${secret.slice(-4)}`;
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label={copied ? "Copied" : `Copy ${label}`}
      onClick={() => {
        navigator.clipboard?.writeText(value).catch(() => {});
        setCopied(true);
      }}
    >
      {copied ? (
        <CheckIcon aria-hidden="true" className="text-success" />
      ) : (
        <CopyIcon aria-hidden="true" />
      )}
    </Button>
  );
}

export default function Table16() {
  const [keys, setKeys] = React.useState(initialKeys);
  const [revealed, setRevealed] = React.useState<string | null>(null);
  const [name, setName] = React.useState("");

  const createKey = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = `k${Date.now()}`;
    const secret = `ak_live_51Hq${Math.random().toString(36).slice(2, 18)}`;
    setKeys((prev) => [
      {
        id,
        name: trimmed,
        secret,
        scope: "Read only",
        created: "Just now",
        lastUsed: "Never",
      },
      ...prev,
    ]);
    setRevealed(id);
    setName("");
  };

  return (
    <div className="w-full max-w-2xl rounded-xl border bg-card text-card-foreground">
      <div className="grid gap-3 px-4 pt-4 pb-3">
        <div className="grid gap-1">
          <h3 id="table-16-title" className="font-semibold">
            API keys
          </h3>
          <p className="text-sm text-muted-foreground">
            Keys authenticate requests to api.relay.dev. Treat them like
            passwords.
          </p>
        </div>
        <form onSubmit={createKey} className="flex gap-2">
          <Input
            aria-label="New key name"
            placeholder="Key name, e.g. CI pipeline"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-8"
          />
          <Button type="submit" size="default" disabled={!name.trim()}>
            <PlusIcon aria-hidden="true" data-icon="inline-start" />
            Create
          </Button>
        </form>
      </div>
      <Table aria-labelledby="table-16-title">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">Name</TableHead>
            <TableHead className="hidden sm:table-cell">Secret key</TableHead>
            <TableHead className="hidden md:table-cell">Last used</TableHead>
            <TableHead className="pr-2 text-right sm:pr-4">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.map((key) => {
            const isRevealed = revealed === key.id && !key.revoked;
            // Rendered in the Secret key column, or under the name on narrow screens.
            const secretControl = (
              <div className="flex items-center gap-0.5">
                <code
                  className={cn(
                    "mr-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs",
                    key.revoked && "line-through",
                    // A revealed key is long; let it wrap instead of widening the table.
                    isRevealed && "min-w-0 break-all whitespace-normal",
                  )}
                >
                  {isRevealed ? key.secret : mask(key.secret)}
                </code>
                {key.revoked ? null : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label={
                        isRevealed
                          ? `Hide ${key.name} key`
                          : `Reveal ${key.name} key`
                      }
                      aria-pressed={isRevealed}
                      onClick={() =>
                        setRevealed(isRevealed ? null : key.id)
                      }
                    >
                      {isRevealed ? (
                        <EyeOffIcon aria-hidden="true" />
                      ) : (
                        <EyeIcon aria-hidden="true" />
                      )}
                    </Button>
                    <CopyButton
                      value={key.secret}
                      label={`${key.name} key`}
                    />
                  </>
                )}
              </div>
            );
            return (
              <TableRow
                key={key.id}
                className={key.revoked ? "text-muted-foreground" : undefined}
              >
                <TableCell className="py-3 pr-1 pl-4 sm:pr-2">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-medium">{key.name}</span>
                    {key.revoked ? (
                      <Badge variant="outline">Revoked</Badge>
                    ) : (
                      <Badge variant="secondary">{key.scope}</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created {key.created}
                  </div>
                  <div className="mt-2 sm:hidden">{secretControl}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {secretControl}
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {key.lastUsed}
                </TableCell>
                <TableCell className="pr-2 pl-0 text-right sm:pr-4 sm:pl-2">
                  {key.revoked ? null : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-2 text-destructive hover:bg-destructive/10 hover:text-destructive sm:px-2.5"
                      onClick={() =>
                        setKeys((prev) =>
                          prev.map((k) =>
                            k.id === key.id ? { ...k, revoked: true } : k,
                          ),
                        )
                      }
                    >
                      Revoke
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
