"use client";

import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import { LabSection } from "../lab-frame";

export default function InputMatrix() {
  return (
    <div>
      <LabSection title="states">
        <Input className="w-48" placeholder="Placeholder" />
        <Input className="w-48" defaultValue="Acme Inc" />
        <Input className="w-48" placeholder="Disabled" disabled />
        <Input className="w-48" defaultValue="Disabled value" disabled />
        <Input className="w-48" defaultValue="Invalid" aria-invalid />
        <Input className="w-48" defaultValue="Read only" readOnly />
      </LabSection>
      <LabSection title="focus (autoFocus on the first; tab through the rest)">
        <Input className="w-48" placeholder="Focused" autoFocus />
        <Input className="w-48" placeholder="Invalid, focus me" aria-invalid />
      </LabSection>
      <LabSection title="types">
        <Input className="w-48" type="email" placeholder="you@example.com" />
        <Input className="w-48" type="password" defaultValue="secret" />
        <Input className="w-64" type="file" />
        <Input className="w-48" type="number" defaultValue={42} />
      </LabSection>
      <LabSection title="with label">
        <div className="grid w-64 gap-2">
          <Label htmlFor="lab-input-name">Workspace name</Label>
          <Input id="lab-input-name" defaultValue="Acme Inc" />
        </div>
      </LabSection>
    </div>
  );
}
