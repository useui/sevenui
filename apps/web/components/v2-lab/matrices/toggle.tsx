"use client";

import { BoldIcon, ItalicIcon } from "lucide-react";
import { Toggle } from "@/registry/base/ui/toggle";
import { LabSection } from "../lab-frame";

const VARIANTS = ["default", "outline"] as const;
const SIZES = ["sm", "default", "lg"] as const;

export default function ToggleMatrix() {
  return (
    <div>
      {VARIANTS.map((variant) => (
        <LabSection key={variant} title={`variant=${variant}`}>
          {SIZES.map((size) => (
            <Toggle key={size} variant={variant} size={size} aria-label={`Bold ${size}`}>
              <BoldIcon />
            </Toggle>
          ))}
          {SIZES.map((size) => (
            <Toggle
              key={`on-${size}`}
              variant={variant}
              size={size}
              defaultPressed
              aria-label={`Bold ${size} pressed`}
            >
              <BoldIcon />
            </Toggle>
          ))}
          <Toggle variant={variant} aria-label="Italic with label">
            <ItalicIcon data-icon="inline-start" />
            Italic
          </Toggle>
          <Toggle variant={variant} defaultPressed aria-label="Italic pressed with label">
            <ItalicIcon data-icon="inline-start" />
            Italic
          </Toggle>
          <Toggle variant={variant} disabled aria-label="Disabled">
            <BoldIcon />
          </Toggle>
          <Toggle variant={variant} disabled defaultPressed aria-label="Disabled pressed">
            <BoldIcon />
          </Toggle>
          <Toggle variant={variant} aria-invalid aria-label="Invalid">
            <BoldIcon />
          </Toggle>
        </LabSection>
      ))}
    </div>
  );
}
