"use client";

import { CheckIcon, CopyIcon, LockIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
} from "@/registry/base/ui/input-group";
import { Label } from "@/registry/base/ui/label";
import { Textarea } from "@/registry/base/ui/textarea";

const recoveryCodes = [
  "7KQ2-M9XD",
  "PL4H-83ZR",
  "W2NC-6TFJ",
  "BY8V-Q5LA",
  "3RDG-H7KE",
  "N6XU-2CPW",
].join("\n");

export default function Textarea03() {
  const id = useId();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function handleCopy() {
    navigator.clipboard?.writeText(recoveryCodes).catch(() => {});
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Label htmlFor={`${id}-codes`}>Recovery codes</Label>
      <InputGroup className="bg-muted/40 dark:bg-muted/30">
        <InputGroupAddon align="block-start" className="border-b">
          <InputGroupText className="text-xs">
            <LockIcon aria-hidden="true" className="size-3.5" />
            Read-only
          </InputGroupText>
          <InputGroupButton
            size="xs"
            className="ml-auto"
            onClick={handleCopy}
            aria-label={copied ? "Recovery codes copied" : "Copy recovery codes"}
          >
            {copied ? (
              <CheckIcon aria-hidden="true" className="text-success" />
            ) : (
              <CopyIcon aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy"}
          </InputGroupButton>
        </InputGroupAddon>
        <Textarea
          data-slot="input-group-control"
          id={`${id}-codes`}
          readOnly
          rows={6}
          value={recoveryCodes}
          aria-describedby={`${id}-hint`}
          className="flex-1 cursor-default resize-none rounded-none border-0 bg-transparent px-3 py-3 shadow-none focus-visible:ring-0 dark:bg-transparent font-mono text-sm leading-6 tracking-wider tabular-nums"
        />
      </InputGroup>
      <p id={`${id}-hint`} className="text-xs text-muted-foreground">
        Each code signs you in once if you lose your authenticator. Store them
        somewhere safe.
      </p>
    </div>
  );
}
