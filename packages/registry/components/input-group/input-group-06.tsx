"use client";

import { useEffect, useId, useRef, useState } from "react";
import { GlobeIcon, LinkIcon, XIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/registry/base/ui/input-group";
import { Label } from "@/registry/base/ui/label";
import { Spinner } from "@/registry/base/ui/spinner";

type Preview = { title: string; site: string };

// Simulated unfurl results, keyed by host and path.
const knownPages: Record<string, Preview> = {
  "northwind.dev/blog/pricing-page-teardown": {
    title: "Pricing page teardown: 12 patterns that lift trial starts",
    site: "Northwind Engineering Blog",
  },
  "docs.relay.so/guides/webhooks": {
    title: "Receiving webhooks: retries, signatures, and idempotency",
    site: "Relay Docs",
  },
};

const URL_PATTERN = /^(?:https?:\/\/)?([a-z0-9-]+(?:\.[a-z0-9-]+)+)(\/\S*)?$/i;

type State =
  | { status: "empty" }
  | { status: "invalid" }
  | { status: "loading" }
  | { status: "ready"; preview: Preview }
  | { status: "fallback"; host: string };

function describe(url: string): Preview | { host: string } {
  const match = url.match(URL_PATTERN);
  const host = match?.[1]?.toLowerCase() ?? "";
  const key = `${host}${(match?.[2] ?? "").replace(/\/$/, "")}`;
  return knownPages[key] ?? { host };
}

export default function InputGroup06() {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("northwind.dev/blog/pricing-page-teardown");
  const [state, setState] = useState<State>({ status: "loading" });

  // Wait for typing to pause, then "fetch" the page. Every keystroke cancels
  // the pending request.
  useEffect(() => {
    const value = url.trim();
    if (!value) {
      setState({ status: "empty" });
      return;
    }
    if (!URL_PATTERN.test(value)) {
      setState({ status: "invalid" });
      return;
    }
    setState({ status: "loading" });
    const timeout = window.setTimeout(() => {
      const result = describe(value);
      setState(
        "title" in result
          ? { status: "ready", preview: result }
          : { status: "fallback", host: result.host },
      );
    }, 900);
    return () => window.clearTimeout(timeout);
  }, [url]);

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <Label htmlFor={`${id}-url`}>Reading list link</Label>
      <InputGroup aria-busy={state.status === "loading"}>
        <InputGroupInput
          ref={inputRef}
          id={`${id}-url`}
          type="url"
          inputMode="url"
          value={url}
          placeholder="Paste an article or docs link"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={state.status === "invalid"}
          aria-describedby={`${id}-preview`}
          onChange={(event) => setUrl(event.target.value)}
        />
        <InputGroupAddon
          align="block-end"
          id={`${id}-preview`}
          aria-live="polite"
          className="min-h-11 border-t"
        >
          {state.status === "empty" ? (
            <InputGroupText className="text-xs">
              <LinkIcon aria-hidden="true" className="size-3.5" />
              A title and site name appear here once the link loads.
            </InputGroupText>
          ) : null}
          {state.status === "invalid" ? (
            <InputGroupText className="text-xs text-destructive">
              That doesn’t look like a web address yet.
            </InputGroupText>
          ) : null}
          {state.status === "loading" ? (
            <InputGroupText className="text-xs">
              <Spinner aria-hidden="true" role="presentation" className="size-3.5" />
              Fetching preview…
            </InputGroupText>
          ) : null}
          {state.status === "ready" || state.status === "fallback" ? (
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                <GlobeIcon aria-hidden="true" className="size-3.5" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-foreground">
                  {state.status === "ready"
                    ? state.preview.title
                    : "No preview available"}
                </span>
                <span className="truncate text-xs font-normal text-muted-foreground">
                  {state.status === "ready"
                    ? state.preview.site
                    : `${state.host} · the link is still saved`}
                </span>
              </span>
              <InputGroupButton
                size="icon-xs"
                aria-label="Clear link"
                onClick={() => {
                  setUrl("");
                  // The button unmounts with the preview, so hand focus back
                  // to the field instead of dropping it on the page.
                  inputRef.current?.focus();
                }}
              >
                <XIcon aria-hidden="true" />
              </InputGroupButton>
            </div>
          ) : null}
        </InputGroupAddon>
      </InputGroup>
      <p className="text-xs text-muted-foreground">
        Try docs.relay.so/guides/webhooks, or any other address.
      </p>
    </div>
  );
}
