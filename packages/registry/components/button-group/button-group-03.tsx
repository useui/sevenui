"use client";

import { Check, Copy, RefreshCw } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import {
  ButtonGroup,
  ButtonGroupText,
} from "@/registry/base/ui/button-group";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

const tokens = ["k7Qm2x", "p9Lw4d", "t3Vn8r"];

export default function ButtonGroup03() {
  const [index, setIndex] = React.useState(0);
  const [copied, setCopied] = React.useState(false);
  const path = `acme.app/join/${tokens[index]}`;

  React.useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard?.writeText(`https://${path}`);
    } catch {
      // Clipboard access can be denied; the confirmation still reflects intent.
    }
    setCopied(true);
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <Label htmlFor="button-group-03-link">Workspace invite link</Label>
      <ButtonGroup className="w-full">
        <ButtonGroupText
          render={<span />}
          className="font-normal text-muted-foreground"
        >
          https://
        </ButtonGroupText>
        <Input
          id="button-group-03-link"
          readOnly
          value={path}
          className="font-mono text-xs md:text-xs"
          onFocus={(event) => event.currentTarget.select()}
        />
        <Button
          variant="outline"
          size="icon"
          aria-label="Generate a new link"
          onClick={() => {
            setIndex((i) => (i + 1) % tokens.length);
            setCopied(false);
          }}
        >
          <RefreshCw aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy link"}
          className="sm:w-22 sm:justify-center"
        >
          {copied ? (
            <Check aria-hidden="true" data-icon="inline-start" />
          ) : (
            <Copy aria-hidden="true" data-icon="inline-start" />
          )}
          <span aria-hidden="true" className="hidden sm:inline">
            {copied ? "Copied" : "Copy"}
          </span>
        </Button>
      </ButtonGroup>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {copied
          ? "Link copied. It expires in 7 days."
          : "Anyone with this link can join as a viewer."}
      </p>
    </div>
  );
}
