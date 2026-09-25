"use client";

import * as React from "react";
import {
  CheckIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  ShieldCheckIcon,
} from "lucide-react";

import { Bubble, BubbleContent, BubbleGroup } from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";

const secret = "vpn-7Rq4-mezo-K2xa";
const revealSeconds = 20;

type State = "hidden" | "revealed" | "destroyed";

export default function Bubble15() {
  const [state, setState] = React.useState<State>("hidden");
  const [remaining, setRemaining] = React.useState(revealSeconds);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (state !== "revealed") return;
    setRemaining(revealSeconds);
    const interval = window.setInterval(() => {
      setRemaining((current) => current - 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [state]);

  React.useEffect(() => {
    if (state === "revealed" && remaining <= 0) {
      setState("hidden");
      setCopied(false);
    }
  }, [state, remaining]);

  function copySecret() {
    navigator.clipboard?.writeText(secret).catch(() => {});
    setCopied(true);
  }

  return (
    <section
      aria-label="IT helpdesk chat"
      className="flex w-full max-w-sm flex-col gap-3"
    >
      <Bubble align="end">
        <BubbleContent>
          My VPN login stopped working after the password reset.
        </BubbleContent>
      </Bubble>

      <BubbleGroup className="gap-1">
        <Bubble variant="muted">
          <BubbleContent>
            Here is a one-time password. It works for a single sign-in and
            expires at 17:30.
          </BubbleContent>
        </Bubble>

        {state === "destroyed" ? (
          <Bubble variant="ghost">
            <BubbleContent className="flex items-center gap-1.5 text-muted-foreground italic">
              <ShieldCheckIcon aria-hidden="true" className="size-4" />
              This password was deleted from the chat.
            </BubbleContent>
          </Bubble>
        ) : (
          <Bubble variant="outline" className="w-full max-w-72">
            <BubbleContent className="flex w-full flex-col gap-2.5 rounded-2xl p-3">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <KeyRoundIcon aria-hidden="true" className="size-3.5" />
                One-time VPN password
              </span>
              <div className="flex items-center gap-1 rounded-lg bg-muted py-1 pr-1 pl-3">
                <span aria-live="polite" className="min-w-0 flex-1 truncate">
                  {state === "revealed" ? (
                    <code className="font-mono text-sm">{secret}</code>
                  ) : (
                    <>
                      <span
                        aria-hidden="true"
                        className="font-mono text-sm tracking-widest text-muted-foreground"
                      >
                        ••••••••••••
                      </span>
                      <span className="sr-only">Password hidden</span>
                    </>
                  )}
                </span>
                {state === "revealed" ? (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={copied ? "Copied" : "Copy password"}
                    onClick={copySecret}
                  >
                    {copied ? (
                      <CheckIcon aria-hidden="true" />
                    ) : (
                      <CopyIcon aria-hidden="true" />
                    )}
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={
                    state === "revealed" ? "Hide password" : "Reveal password"
                  }
                  onClick={() => {
                    setCopied(false);
                    setState(state === "revealed" ? "hidden" : "revealed");
                  }}
                >
                  {state === "revealed" ? (
                    <EyeOffIcon aria-hidden="true" />
                  ) : (
                    <EyeIcon aria-hidden="true" />
                  )}
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                  {state === "revealed"
                    ? `Hides again in ${remaining}s`
                    : "Only visible to you"}
                </span>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setState("destroyed")}
                >
                  I'm signed in, delete it
                </Button>
              </div>
            </BubbleContent>
          </Bubble>
        )}
      </BubbleGroup>
    </section>
  );
}
