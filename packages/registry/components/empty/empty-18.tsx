"use client";

import * as React from "react";
import { CheckIcon, CopyIcon, KeyRoundIcon, TriangleAlertIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";
import { Input } from "@/registry/base/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/base/ui/input-group";

type ApiKey = { id: string; name: string; secret: string; created: string };

function generateSecret() {
  const alphabet = "abcdefghijkmnopqrstuvwxyz23456789";
  let body = "";
  for (let index = 0; index < 32; index++) {
    body += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `acme_sk_${body}`;
}

export default function Empty18() {
  const [keys, setKeys] = React.useState<ApiKey[]>([]);
  const [creating, setCreating] = React.useState(false);
  const [name, setName] = React.useState("Production server");
  const [revealed, setRevealed] = React.useState<ApiKey | null>(null);
  const [copied, setCopied] = React.useState(false);
  const nameRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (creating) nameRef.current?.focus();
  }, [creating]);

  React.useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  function createKey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const key: ApiKey = {
      id: `key-${keys.length + 1}`,
      name: name.trim() || "Untitled key",
      secret: generateSecret(),
      created: "Just now",
    };
    setKeys((current) => [...current, key]);
    setRevealed(key);
    setCreating(false);
  }

  async function copySecret(secret: string) {
    try {
      await navigator.clipboard?.writeText(secret);
      setCopied(true);
    } catch {
      // Clipboard access can be blocked; the field stays selectable.
    }
  }

  return (
    <section
      aria-labelledby="empty-18-title"
      className="w-full max-w-lg rounded-xl border bg-card text-card-foreground shadow-sm"
    >
      <header className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2 id="empty-18-title" className="text-sm font-medium">
            API keys
          </h2>
          <p className="text-xs text-muted-foreground">
            Authenticate requests to api.acme.dev
          </p>
        </div>
        {keys.length > 0 && !creating && (
          <Button size="sm" variant="outline" onClick={() => setCreating(true)}>
            Create key
          </Button>
        )}
      </header>
      <div className="flex flex-col gap-4 p-4">
        {creating && (
          <form
            onSubmit={createKey}
            className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3"
          >
            <label htmlFor="empty-18-name" className="text-sm font-medium">
              Key name
            </label>
            <Input
              ref={nameRef}
              id="empty-18-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Production server"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setCreating(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Create secret key
              </Button>
            </div>
          </form>
        )}

        {revealed && (
          <div
            role="status"
            className="flex flex-col gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3"
          >
            <p className="flex items-center gap-2 text-sm font-medium">
              <TriangleAlertIcon className="size-4 text-warning-foreground dark:text-warning" aria-hidden="true" />
              Copy your key now
            </p>
            <p className="text-xs text-muted-foreground">
              For security, &ldquo;{revealed.name}&rdquo; is shown only once.
              Store it in your secrets manager.
            </p>
            <InputGroup className="bg-background">
              <InputGroupInput
                readOnly
                value={revealed.secret}
                aria-label="Secret key"
                className="font-mono text-xs"
                onFocus={(event) => event.currentTarget.select()}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  aria-label={copied ? "Copied" : "Copy secret key"}
                  onClick={() => copySecret(revealed.secret)}
                >
                  {copied ? (
                    <CheckIcon aria-hidden="true" />
                  ) : (
                    <CopyIcon aria-hidden="true" />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <Button
              size="sm"
              variant="outline"
              className="self-end"
              onClick={() => setRevealed(null)}
            >
              I&apos;ve saved it
            </Button>
          </div>
        )}

        {keys.length === 0 && !creating ? (
          <Empty className="border py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <KeyRoundIcon aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>No API keys yet</EmptyTitle>
              <EmptyDescription>
                Create a secret key to call the API from your server. Pass it as
                a bearer token:
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="max-w-md">
              <pre className="w-full overflow-x-auto rounded-lg bg-muted px-3 py-2.5 text-left font-mono text-xs leading-relaxed">
                <code>
                  <span className="text-muted-foreground">$ </span>curl
                  https://api.acme.dev/v1/orders \{"\n"}
                  {"  "}-H &quot;Authorization: Bearer $ACME_KEY&quot;
                </code>
              </pre>
              <Button size="sm" onClick={() => setCreating(true)}>
                Create secret key
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          keys.length > 0 && (
            <ul aria-label="API keys" className="flex flex-col divide-y rounded-lg border">
              {keys.map((key) => (
                <li key={key.id} className="flex items-center gap-3 px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{key.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      acme_sk_&hellip;{key.secret.slice(-4)}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {key.created}
                  </span>
                  <Badge variant="outline">Full access</Badge>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </section>
  );
}
