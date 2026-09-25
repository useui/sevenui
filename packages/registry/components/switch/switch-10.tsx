"use client";

import * as React from "react";
import { CircleAlert, KeyRound, MessageSquare, ShieldCheck, Smartphone } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";

type MethodId = "app" | "key" | "sms";

const methods: {
  id: MethodId;
  label: string;
  detail: string;
  icon: typeof Smartphone;
}[] = [
  { id: "app", label: "Authenticator app", detail: "Added March 4 · 1Password", icon: Smartphone },
  { id: "key", label: "Security key", detail: "YubiKey 5C NFC", icon: KeyRound },
  { id: "sms", label: "Text message", detail: "Codes sent to •••• 0142", icon: MessageSquare },
];

const recoveryCodes = [
  { code: "7f3k-92pd", used: true },
  { code: "m4qx-18vt", used: false },
  { code: "c9ne-50ra", used: false },
  { code: "w2hb-67ls", used: true },
  { code: "p8dy-31kf", used: false },
  { code: "t5gm-04zc", used: false },
  { code: "r1vj-83nw", used: false },
  { code: "h6sa-29qe", used: false },
  { code: "b3uf-75mx", used: false },
  { code: "k0lz-46yd", used: false },
];

export default function Switch10() {
  const [enabled, setEnabled] = React.useState<Record<MethodId, boolean>>({
    app: true,
    key: false,
    sms: false,
  });
  const [blocked, setBlocked] = React.useState<MethodId | null>(null);
  const [showCodes, setShowCodes] = React.useState(false);
  const codesLeft = recoveryCodes.filter((entry) => !entry.used).length;

  const onCount = methods.filter((method) => enabled[method.id]).length;
  const preferred = methods.find((method) => enabled[method.id]);

  function handleChange(id: MethodId, checked: boolean) {
    // Two-step verification needs at least one method; refuse to turn off the last one.
    if (!checked && onCount === 1) {
      setBlocked(id);
      return;
    }
    setBlocked(null);
    setEnabled((current) => ({ ...current, [id]: checked }));
  }

  return (
    <section
      aria-labelledby="switch-10-title"
      className="w-full max-w-md rounded-xl border border-border bg-card text-card-foreground"
    >
      <div className="flex items-start gap-3 border-b border-border p-4">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-success" />
        <div className="flex flex-col gap-0.5">
          <h3 id="switch-10-title" className="font-medium">
            Two-step verification
          </h3>
          <p className="text-sm text-muted-foreground">
            {onCount} {onCount === 1 ? "method" : "methods"} on. Keep a backup in case you lose
            your phone.
          </p>
        </div>
      </div>

      <ul className="flex flex-col divide-y divide-border">
        {methods.map((method) => {
          const Icon = method.icon;
          const id = `switch-10-${method.id}`;
          const isBlocked = blocked === method.id;
          return (
            <li key={method.id} className="flex flex-col gap-2 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Label htmlFor={id}>{method.label}</Label>
                    {preferred?.id === method.id ? <Badge variant="secondary">Default</Badge> : null}
                  </div>
                  <span id={`${id}-detail`} className="truncate text-xs text-muted-foreground">
                    {method.detail}
                  </span>
                </div>
                <Switch
                  id={id}
                  checked={enabled[method.id]}
                  onCheckedChange={(checked) => handleChange(method.id, checked)}
                  aria-invalid={isBlocked || undefined}
                  aria-describedby={isBlocked ? `${id}-detail ${id}-error` : `${id}-detail`}
                />
              </div>
              {isBlocked ? (
                <p
                  id={`${id}-error`}
                  role="alert"
                  className="flex items-start gap-1.5 pl-11 text-xs text-destructive"
                >
                  <CircleAlert aria-hidden="true" className="mt-px size-3.5 shrink-0" />
                  Turn on another method first. Your account needs at least one.
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-3 border-t border-border px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground tabular-nums">
            {codesLeft} of {recoveryCodes.length} recovery codes left
          </span>
          <Button
            variant="outline"
            size="sm"
            aria-expanded={showCodes}
            aria-controls="switch-10-codes"
            onClick={() => setShowCodes((current) => !current)}
          >
            {showCodes ? "Hide recovery codes" : "View recovery codes"}
          </Button>
        </div>
        <ul
          id="switch-10-codes"
          hidden={!showCodes}
          aria-label="Recovery codes"
          className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-lg bg-muted px-3 py-2 font-mono text-xs"
        >
          {recoveryCodes.map((entry) => (
            <li
              key={entry.code}
              className={
                entry.used ? "text-muted-foreground line-through" : "text-foreground tabular-nums"
              }
            >
              {entry.code}
              {entry.used ? <span className="sr-only"> (used)</span> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
