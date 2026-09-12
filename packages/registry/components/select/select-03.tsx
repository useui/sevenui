"use client";

import { Label } from "@/registry/base/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";

const plans = [
  { value: "starter", label: "Starter", description: "For solo projects and side hustles" },
  { value: "team", label: "Team", description: "For growing teams that ship together" },
  { value: "enterprise", label: "Enterprise", description: "Advanced controls and support" },
];

export default function Select03() {
  return (
    <div className="grid w-full max-w-xs gap-1.5">
      <Label htmlFor="select-03-plan">Plan</Label>
      <Select items={plans} defaultValue="team">
        <SelectTrigger id="select-03-plan" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {plans.map((plan) => (
            <SelectItem key={plan.value} value={plan.value}>
              <span className="flex flex-col">
                <span>{plan.label}</span>
                <span className="text-xs text-muted-foreground">{plan.description}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
