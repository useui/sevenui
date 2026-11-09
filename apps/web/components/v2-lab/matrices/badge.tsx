"use client";

import { CheckIcon } from "lucide-react";
import { Badge } from "@/registry/base/ui/badge";
import { Spinner } from "@/registry/base/ui/spinner";
import { LabSection } from "../lab-frame";

const VARIANTS = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "link",
  "destructive",
  "success",
  "warning",
] as const;

export default function BadgeMatrix() {
  return (
    <div>
      {VARIANTS.map((variant) => (
        <LabSection key={variant} title={`variant=${variant}`}>
          <Badge variant={variant}>{variant}</Badge>
          <Badge variant={variant}>
            <CheckIcon data-icon="inline-start" />
            With icon
          </Badge>
          <Badge variant={variant}>
            <Spinner data-icon="inline-start" />
            Processing
          </Badge>
          <Badge variant={variant} render={<a href="#badge" />}>
            Link (tab to focus)
          </Badge>
          <Badge variant={variant} aria-invalid>
            invalid
          </Badge>
        </LabSection>
      ))}
    </div>
  );
}
