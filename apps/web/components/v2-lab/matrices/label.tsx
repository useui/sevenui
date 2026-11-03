"use client";

import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import { LabSection } from "../lab-frame";

export default function LabelMatrix() {
  return (
    <div>
      <LabSection title="default">
        <Label>Workspace name</Label>
      </LabSection>
      <LabSection title="wrapping a checkbox">
        <Label>
          <input type="checkbox" defaultChecked />
          Email me updates
        </Label>
        <Label>
          <input type="checkbox" disabled />
          Disabled (has-[:disabled])
        </Label>
      </LabSection>
      <LabSection title="peer-disabled">
        <div className="flex items-center gap-2">
          <input id="lab-label-peer" type="checkbox" disabled className="peer" />
          <Label htmlFor="lab-label-peer">Disabled peer</Label>
        </div>
      </LabSection>
      <LabSection title="group-data-[disabled=true]">
        <div data-disabled="true" className="group">
          <Label>Inside a disabled group</Label>
        </div>
      </LabSection>
      <LabSection title="above a field">
        <div className="grid w-64 gap-2">
          <Label htmlFor="lab-label-field">Email</Label>
          <Input id="lab-label-field" placeholder="you@example.com" />
        </div>
      </LabSection>
    </div>
  );
}
