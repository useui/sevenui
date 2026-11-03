"use client";

import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";
import { LabSection } from "../lab-frame";

const VARIANTS = ["default", "outline"] as const;
const SIZES = ["sm", "default", "lg"] as const;

function Items() {
  return (
    <>
      <ToggleGroupItem value="left" aria-label="Align left">
        <AlignLeftIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <AlignCenterIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <AlignRightIcon />
      </ToggleGroupItem>
    </>
  );
}

export default function ToggleGroupMatrix() {
  return (
    <div>
      {VARIANTS.map((variant) => (
        <LabSection key={variant} title={`segmented (spacing=0), variant=${variant}`}>
          {SIZES.map((size) => (
            <ToggleGroup
              key={size}
              variant={variant}
              size={size}
              spacing={0}
              defaultValue={["center"]}
              aria-label={`Alignment ${size}`}
            >
              <Items />
            </ToggleGroup>
          ))}
          <ToggleGroup
            variant={variant}
            spacing={0}
            defaultValue={["week"]}
            aria-label="Range"
          >
            <ToggleGroupItem value="day">Day</ToggleGroupItem>
            <ToggleGroupItem value="week">Week</ToggleGroupItem>
            <ToggleGroupItem value="month">Month</ToggleGroupItem>
          </ToggleGroup>
        </LabSection>
      ))}
      {VARIANTS.map((variant) => (
        <LabSection key={`spaced-${variant}`} title={`spaced (spacing=2), variant=${variant}`}>
          <ToggleGroup
            variant={variant}
            multiple
            defaultValue={["left", "right"]}
            aria-label="Spaced alignment"
          >
            <Items />
          </ToggleGroup>
        </LabSection>
      ))}
      <LabSection title="vertical, disabled, disabled item">
        <ToggleGroup
          orientation="vertical"
          spacing={0}
          defaultValue={["left"]}
          aria-label="Vertical alignment"
        >
          <Items />
        </ToggleGroup>
        <ToggleGroup spacing={0} disabled defaultValue={["center"]} aria-label="Disabled group">
          <Items />
        </ToggleGroup>
        <ToggleGroup spacing={0} defaultValue={["left"]} aria-label="Disabled item">
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="center" disabled>
            Center
          </ToggleGroupItem>
          <ToggleGroupItem value="right">Right</ToggleGroupItem>
        </ToggleGroup>
      </LabSection>
    </div>
  );
}
