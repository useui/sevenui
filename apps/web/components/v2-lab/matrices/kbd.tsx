"use client";

import { CommandIcon } from "lucide-react";
import { Button } from "@/registry/base/ui/button";
import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";
import { LabSection } from "../lab-frame";

export default function KbdMatrix() {
  return (
    <div>
      <LabSection title="single keys">
        <Kbd>K</Kbd>
        <Kbd>Esc</Kbd>
        <Kbd>Enter</Kbd>
        <Kbd>
          <CommandIcon />
        </Kbd>
        <Kbd>⇧</Kbd>
      </LabSection>
      <LabSection title="group">
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <span>+</span>
          <Kbd>B</Kbd>
        </KbdGroup>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </LabSection>
      <LabSection title="in context (inline text, inside a button)">
        <p className="text-muted-foreground text-sm">
          Press <Kbd>/</Kbd> to search.
        </p>
        <Button variant="outline">
          Search
          <Kbd>⌘K</Kbd>
        </Button>
      </LabSection>
    </div>
  );
}
