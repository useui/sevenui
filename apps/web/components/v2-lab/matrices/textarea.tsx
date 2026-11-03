"use client";

import { Label } from "@/registry/base/ui/label";
import { Textarea } from "@/registry/base/ui/textarea";
import { LabSection } from "../lab-frame";

export default function TextareaMatrix() {
  return (
    <div>
      <LabSection title="states">
        <Textarea className="w-56" placeholder="Placeholder" />
        <Textarea
          className="w-56"
          defaultValue={"A longer value that wraps\nacross a couple of lines."}
        />
        <Textarea className="w-56" placeholder="Disabled" disabled />
        <Textarea className="w-56" defaultValue="Invalid" aria-invalid />
      </LabSection>
      <LabSection title="with label">
        <div className="grid w-72 gap-2">
          <Label htmlFor="lab-textarea-notes">Notes</Label>
          <Textarea id="lab-textarea-notes" placeholder="Tab here to see focus" />
        </div>
      </LabSection>
    </div>
  );
}
