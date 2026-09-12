"use client";

import { Label } from "@/registry/base/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";

const roles = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin", disabled: true },
  { value: "owner", label: "Owner", disabled: true },
];

export default function Select04() {
  return (
    <div className="grid w-full max-w-xs gap-1.5">
      <Label htmlFor="select-04-role">Role</Label>
      <Select items={roles}>
        <SelectTrigger id="select-04-role" className="w-full">
          <SelectValue placeholder="Select a role" />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role.value} value={role.value} disabled={role.disabled}>
              {role.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
