"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/base/ui/dialog";
import { Input } from "@/registry/base/ui/input";

export default function Dialog03() {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const link = "https://example.com/s/9f3a1c";

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline">Share link</Button>} />
      <DialogContent className="sm:max-w-106">
        <DialogHeader>
          <DialogTitle>Share this document</DialogTitle>
          <DialogDescription>
            Anyone with this link can view the document. No sign-in required.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input
            readOnly
            value={link}
            aria-label="Share link"
            className="flex-1"
            onFocus={(event) => event.currentTarget.select()}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleCopy}
            aria-label={copied ? "Link copied" : "Copy link"}
          >
            {copied ? (
              <Check aria-hidden="true" />
            ) : (
              <Copy aria-hidden="true" />
            )}
          </Button>
        </div>
        <p className="sr-only" aria-live="polite">
          {copied ? "Link copied to clipboard." : ""}
        </p>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}
