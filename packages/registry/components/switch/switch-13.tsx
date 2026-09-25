"use client";

import { CheckIcon, CopyIcon, FileTextIcon, GlobeIcon, LockIcon } from "lucide-react";
import * as React from "react";

import { Input } from "@/registry/base/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/base/ui/input-group";
import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";

const shareUrl = "https://files.northwind.app/s/q3-board-deck-7fk2";

const linkOptions = [
  {
    id: "downloads",
    label: "Allow downloads",
    description: "Viewers can save a copy of the PDF.",
  },
  {
    id: "expires",
    label: "Expire in 7 days",
    description: "The link stops working on October 2.",
  },
] as const;

type LinkOptionId = (typeof linkOptions)[number]["id"];

export default function Switch13() {
  const [isPublic, setIsPublic] = React.useState(true);
  const [options, setOptions] = React.useState<Record<LinkOptionId, boolean>>({
    downloads: false,
    expires: true,
  });
  const [passwordOn, setPasswordOn] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const passwordTooShort = password.length > 0 && password.length < 8;

  React.useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section
      aria-labelledby="switch-13-title"
      className="w-full max-w-md rounded-xl border border-border bg-card text-card-foreground"
    >
      <div className="flex items-center gap-3 border-b border-border p-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <FileTextIcon aria-hidden="true" className="size-4 text-muted-foreground" />
        </div>
        <div className="flex min-w-0 flex-col">
          <h3 id="switch-13-title" className="truncate text-sm font-medium">
            Share “Q3 board deck.pdf”
          </h3>
          <p className="text-xs text-muted-foreground">4.2 MB · Edited by Maya Chen</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {isPublic ? (
              <GlobeIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
            ) : (
              <LockIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            )}
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="switch-13-public">Anyone with the link</Label>
              <p className="text-xs text-muted-foreground" aria-live="polite">
                {isPublic
                  ? "Anyone who has the link can view this file."
                  : "Only people in Northwind can open this file."}
              </p>
            </div>
          </div>
          <Switch
            id="switch-13-public"
            checked={isPublic}
            onCheckedChange={setIsPublic}
            aria-controls="switch-13-link-settings"
          />
        </div>

        <div id="switch-13-link-settings" hidden={!isPublic} className="flex flex-col gap-4">
          <InputGroup>
            <InputGroupInput
              readOnly
              value={shareUrl}
              aria-label="Share link"
              onFocus={(event) => event.currentTarget.select()}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton onClick={copyLink}>
                {copied ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}
                {copied ? "Copied" : "Copy"}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>

          <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {linkOptions.map((option) => (
              <div key={option.id} className="flex items-center justify-between gap-4 px-3 py-2.5">
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor={`switch-13-${option.id}`}>{option.label}</Label>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </div>
                <Switch
                  id={`switch-13-${option.id}`}
                  size="sm"
                  checked={options[option.id]}
                  onCheckedChange={(checked) =>
                    setOptions((current) => ({ ...current, [option.id]: checked }))
                  }
                />
              </div>
            ))}
            <div className="flex flex-col gap-2.5 px-3 py-2.5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor="switch-13-password">Require a password</Label>
                  <span className="text-xs text-muted-foreground">
                    Share the password separately from the link.
                  </span>
                </div>
                <Switch
                  id="switch-13-password"
                  size="sm"
                  checked={passwordOn}
                  onCheckedChange={setPasswordOn}
                  aria-controls="switch-13-password-field"
                />
              </div>
              <div
                id="switch-13-password-field"
                hidden={!passwordOn}
                className="flex flex-col gap-1.5"
              >
                <Input
                  type="password"
                  autoComplete="new-password"
                  aria-label="Link password"
                  placeholder="At least 8 characters"
                  value={password}
                  aria-invalid={passwordTooShort || undefined}
                  aria-describedby={passwordTooShort ? "switch-13-password-error" : undefined}
                  onChange={(event) => setPassword(event.target.value)}
                />
                {passwordTooShort ? (
                  <p id="switch-13-password-error" className="text-xs text-destructive">
                    Use at least 8 characters.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
