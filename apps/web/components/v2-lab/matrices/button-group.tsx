"use client";

import { ChevronDownIcon, MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "@/registry/base/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/registry/base/ui/button-group";
import { LabSection } from "../lab-frame";

const VARIANTS = ["outline", "secondary", "default", "accent"] as const;
const SIZES = ["xs", "sm", "default", "lg"] as const;

export default function ButtonGroupMatrix() {
  return (
    <div>
      {VARIANTS.map((variant) => (
        <LabSection key={variant} title={`horizontal, variant=${variant}`}>
          <ButtonGroup aria-label={`${variant} actions`}>
            <Button variant={variant}>Archive</Button>
            <Button variant={variant}>Report</Button>
            <Button variant={variant}>Snooze</Button>
          </ButtonGroup>
          <ButtonGroup aria-label={`${variant} split`}>
            <Button variant={variant}>Merge</Button>
            <ButtonGroupSeparator />
            <Button variant={variant} size="icon" aria-label="More options">
              <ChevronDownIcon />
            </Button>
          </ButtonGroup>
        </LabSection>
      ))}
      <LabSection title="sizes (outline)">
        {SIZES.map((size) => (
          <ButtonGroup key={size} aria-label={`size ${size}`}>
            <Button variant="outline" size={size}>
              {size}
            </Button>
            <Button variant="outline" size={size}>
              two
            </Button>
          </ButtonGroup>
        ))}
      </LabSection>
      <LabSection title="text addon, disabled, invalid">
        <ButtonGroup aria-label="Url">
          <ButtonGroupText>https://</ButtonGroupText>
          <Button variant="outline">sevenui.dev</Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Disabled">
          <Button variant="outline" disabled>
            Left
          </Button>
          <Button variant="outline">Right</Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Invalid">
          <Button variant="outline">Left</Button>
          <Button variant="outline" aria-invalid>
            Invalid
          </Button>
        </ButtonGroup>
      </LabSection>
      <LabSection title="vertical + nested">
        <ButtonGroup orientation="vertical" aria-label="Zoom">
          <Button variant="outline" size="icon" aria-label="Zoom in">
            <PlusIcon />
          </Button>
          <Button variant="outline" size="icon" aria-label="Zoom out">
            <MinusIcon />
          </Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Nested">
          <ButtonGroup>
            <Button variant="outline">1</Button>
            <Button variant="outline">2</Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button variant="outline">Previous</Button>
            <Button variant="outline">Next</Button>
          </ButtonGroup>
        </ButtonGroup>
      </LabSection>
    </div>
  );
}
