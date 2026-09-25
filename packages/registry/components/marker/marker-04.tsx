"use client";

import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleXIcon,
  InfoIcon,
} from "lucide-react";
import { cn } from "cn";

import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@/registry/base/ui/marker";

const tones = {
  info: { icon: InfoIcon, className: "text-muted-foreground", label: "Info" },
  success: { icon: CircleCheckIcon, className: "text-success", label: "Passed" },
  warning: {
    icon: CircleAlertIcon,
    className: "text-warning",
    label: "Warning",
  },
  error: { icon: CircleXIcon, className: "text-destructive", label: "Failed" },
} as const;

const steps: { id: string; tone: keyof typeof tones; text: string }[] = [
  { id: "queued", tone: "info", text: "Build 1842 queued on runner eu\u2011west\u20112" },
  { id: "tests", tone: "success", text: "412 unit tests passed in 38s" },
  {
    id: "bundle",
    tone: "warning",
    text: "Bundle grew 18 KB — above the 10 KB budget",
  },
  {
    id: "e2e",
    tone: "error",
    text: "E2E: checkout.spec.ts timed out after 30s",
  },
];

export default function Marker04() {
  return (
    <ol
      aria-label="Build 1842 log"
      className="flex w-full max-w-sm flex-col gap-3"
    >
      {steps.map((step) => {
        const tone = tones[step.tone];
        return (
          <li key={step.id}>
            <Marker
              data-tone={step.tone}
              className="items-start data-[tone=error]:text-foreground"
            >
              <MarkerIcon className={cn("mt-0.5", tone.className)}>
                <tone.icon />
              </MarkerIcon>
              <MarkerContent>
                <span className="sr-only">{tone.label}: </span>
                {step.text}
              </MarkerContent>
            </Marker>
          </li>
        );
      })}
    </ol>
  );
}
