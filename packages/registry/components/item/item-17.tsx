"use client";

import * as React from "react";
import {
  CheckIcon,
  CopyIcon,
  KeyRoundIcon,
  TriangleAlertIcon,
} from "lucide-react";

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
  AlertDialogTrigger,
} from "@/registry/base/ui/alert-dialog";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/registry/base/ui/item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";

type Scope = "full" | "read" | "ingest";

const SCOPES: { value: Scope; label: string }[] = [
  { value: "full", label: "Full access" },
  { value: "read", label: "Read only" },
  { value: "ingest", label: "Ingest only" },
];

type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  scope: Scope;
  created: string;
  lastUsed: string | null;
};

const INITIAL_KEYS: ApiKey[] = [
  {
    id: "key-prod",
    name: "Production backend",
    prefix: "sk_live_4f9c",
    scope: "full",
    created: "Mar 3, 2026",
    lastUsed: "2 minutes ago",
  },
  {
    id: "key-metrics",
    name: "Metrics dashboard",
    prefix: "sk_live_a71e",
    scope: "read",
    created: "Jul 19, 2026",
    lastUsed: "Yesterday",
  },
  {
    id: "key-ci",
    name: "CI smoke tests",
    prefix: "sk_test_0b2d",
    scope: "ingest",
    created: "Sep 20, 2026",
    lastUsed: null,
  },
];

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

function randomSecret(length: number) {
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => ALPHABET[value % ALPHABET.length]).join(
    "",
  );
}

function scopeLabel(scope: Scope) {
  return SCOPES.find((entry) => entry.value === scope)?.label ?? scope;
}

export default function Item17() {
  const id = React.useId();
  const [keys, setKeys] = React.useState<ApiKey[]>(INITIAL_KEYS);
  const [name, setName] = React.useState("");
  const [scope, setScope] = React.useState<Scope>("read");
  const [error, setError] = React.useState<string | null>(null);
  const [revealed, setRevealed] = React.useState<{
    id: string;
    secret: string;
  } | null>(null);
  const [copied, setCopied] = React.useState(false);

  function createKey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Give the key a name so you can recognize it later.");
      return;
    }
    if (keys.some((key) => key.name.toLowerCase() === trimmed.toLowerCase())) {
      setError("A key with this name already exists.");
      return;
    }
    const secret = `sk_live_${randomSecret(28)}`;
    const keyId = `key-${Date.now()}`;
    setKeys((prev) => [
      {
        id: keyId,
        name: trimmed,
        prefix: secret.slice(0, 12),
        scope,
        created: "Just now",
        lastUsed: null,
      },
      ...prev,
    ]);
    setRevealed({ id: keyId, secret });
    setCopied(false);
    setName("");
    setError(null);
  }

  async function copySecret(secret: string) {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function revoke(id: string) {
    setKeys((prev) => prev.filter((key) => key.id !== id));
    if (revealed?.id === id) setRevealed(null);
  }

  return (
    <div className="w-full max-w-lg rounded-xl border bg-card text-card-foreground">
      <form
        onSubmit={createKey}
        noValidate
        aria-labelledby={`${id}-heading`}
        className="space-y-3 border-b p-4"
      >
        <div className="space-y-1">
          <h3 id={`${id}-heading`} className="text-sm font-semibold">
            API keys
          </h3>
          <p className="text-sm text-muted-foreground">
            Keys authenticate server-side requests. Never ship them in client
            code.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            aria-label="Key name"
            placeholder="Key name, e.g. Billing worker"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (error) setError(null);
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className="sm:flex-1"
          />
          <div className="flex gap-2">
            <Select
              items={SCOPES}
              value={scope}
              onValueChange={(value) => setScope(value as Scope)}
            >
              <SelectTrigger
                aria-label="Permissions"
                className="flex-1 sm:w-34"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCOPES.map((entry) => (
                  <SelectItem key={entry.value} value={entry.value}>
                    {entry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit">Create</Button>
          </div>
        </div>
        {error && (
          <p id={`${id}-error`} className="text-sm text-destructive">
            {error}
          </p>
        )}
      </form>

      {keys.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
          <KeyRoundIcon
            aria-hidden="true"
            className="size-6 text-muted-foreground"
          />
          <p className="text-sm font-medium">No active keys</p>
          <p className="text-sm text-muted-foreground">
            Requests without a key will be rejected with a 401.
          </p>
        </div>
      ) : (
        <ItemGroup aria-label="Active API keys" className="gap-0 divide-y">
          {keys.map((key) => {
            const isNew = revealed?.id === key.id;
            return (
              <Item
                key={key.id}
                role="listitem"
                className="rounded-none px-4 py-3"
              >
                <ItemMedia
                  variant="icon"
                  className="size-8 rounded-md border bg-muted/50 text-muted-foreground"
                >
                  <KeyRoundIcon aria-hidden="true" />
                </ItemMedia>
                <ItemContent className="min-w-0">
                  <ItemTitle className="w-full flex-wrap gap-y-1">
                    <span className="min-w-0 truncate">{key.name}</span>
                    <Badge
                      variant={key.scope === "full" ? "secondary" : "outline"}
                    >
                      {scopeLabel(key.scope)}
                    </Badge>
                  </ItemTitle>
                  <ItemDescription className="flex flex-wrap gap-x-2 text-xs">
                    <code className="font-mono text-foreground">
                      {key.prefix}…
                    </code>
                    <span>
                      {key.lastUsed ? `Used ${key.lastUsed}` : "Never used"}
                    </span>
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-destructive"
                        />
                      }
                    >
                      Revoke
                      <span className="sr-only"> {key.name}</span>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogMedia className="bg-destructive/10 text-destructive">
                          <TriangleAlertIcon aria-hidden="true" />
                        </AlertDialogMedia>
                        <AlertDialogTitle>
                          Revoke “{key.name}”?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {key.lastUsed
                            ? `This key was used ${key.lastUsed.toLowerCase()}. Requests signed with it will fail immediately.`
                            : "Requests signed with this key will fail immediately."}{" "}
                          This can't be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep key</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={() => revoke(key.id)}
                        >
                          Revoke key
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </ItemActions>

                {isNew && revealed && (
                  <ItemFooter className="flex-col items-stretch gap-2 rounded-lg border border-dashed bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">
                      Copy this secret now. For your security it won't be shown
                      again.
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="min-w-0 flex-1 truncate rounded-md border bg-background px-2 py-1.5 font-mono text-xs">
                        {revealed.secret}
                      </code>
                      <Button
                        size="icon-sm"
                        variant="outline"
                        aria-label={copied ? "Secret copied" : "Copy secret"}
                        onClick={() => copySecret(revealed.secret)}
                      >
                        {copied ? (
                          <CheckIcon aria-hidden="true" />
                        ) : (
                          <CopyIcon aria-hidden="true" />
                        )}
                      </Button>
                    </div>
                    <Button
                      size="xs"
                      variant="ghost"
                      className="self-end"
                      onClick={() => setRevealed(null)}
                    >
                      I've saved it
                    </Button>
                  </ItemFooter>
                )}
              </Item>
            );
          })}
        </ItemGroup>
      )}
    </div>
  );
}
