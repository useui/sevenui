"use client";

import { PlusIcon } from "lucide-react";
import { Button } from "@/registry/base/ui/button";
import { LabSection } from "../lab-frame";

const VARIANTS = [
  "default",
  "outline",
  "secondary",
  "ghost",
  "destructive",
  "link",
] as const;
const SIZES = ["xs", "sm", "default", "lg"] as const;
const ICON_SIZES = ["icon-xs", "icon-sm", "icon", "icon-lg"] as const;

export default function ButtonMatrix() {
  return (
    <div>
      {VARIANTS.map((variant) => (
        <LabSection key={variant} title={`variant=${variant}`}>
          {SIZES.map((size) => (
            <Button key={size} variant={variant} size={size}>
              {size}
            </Button>
          ))}
          <Button variant={variant} disabled>
            disabled
          </Button>
          <Button variant={variant} aria-invalid>
            invalid
          </Button>
          <Button variant={variant} aria-expanded>
            open
          </Button>
          {/* Static stand-in for the :active press (scale + 1px drop). */}
          <Button variant={variant} className="translate-y-px scale-[0.985]">
            pressed
          </Button>
          <Button variant={variant}>
            <PlusIcon data-icon="inline-start" />
            With icon
          </Button>
          <Button variant={variant}>
            With icon
            <PlusIcon data-icon="inline-end" />
          </Button>
          {ICON_SIZES.map((size) => (
            <Button key={size} variant={variant} size={size} aria-label={size}>
              <PlusIcon />
            </Button>
          ))}
          <Button variant={variant} className="max-w-40 overflow-hidden text-ellipsis">
            A very long button label that should truncate
          </Button>
        </LabSection>
      ))}
    </div>
  );
}
