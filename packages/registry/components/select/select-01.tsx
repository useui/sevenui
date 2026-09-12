"use client";

import { Label } from "@/registry/base/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";

const statuses = [
  { value: "active", label: "Active", dotClassName: "bg-emerald-500" },
  { value: "pending", label: "Pending", dotClassName: "bg-amber-500" },
  { value: "failed", label: "Failed", dotClassName: "bg-red-500" },
];

export default function Select01() {
  return (
    <div className="grid w-full max-w-xs gap-1.5">
      <Label htmlFor="select-01-status">Status</Label>
      <Select items={statuses} defaultValue="active">
        <SelectTrigger id="select-01-status" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              <span
                aria-hidden="true"
                className={`size-1.5 rounded-full ${status.dotClassName}`}
              />
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
