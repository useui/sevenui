"use client";

import { Label } from "@/registry/base/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";

const priorities = ["Urgent", "High", "Medium", "Low"];
const sortOrders = ["Newest first", "Oldest first", "Most replies"];
const teams = ["Billing", "Growth", "Mobile", "Platform"];
const assignees = ["Unassigned", "Maya Chen", "Jonas Weber", "Priya Raman"];

export default function NativeSelect04() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="native-select-04-outline">Priority</Label>
        <NativeSelect
          id="native-select-04-outline"
          defaultValue="High"
          className="w-full"
        >
          {priorities.map((priority) => (
            <NativeSelectOption key={priority} value={priority}>
              {priority}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="native-select-04-filled">Assignee</Label>
        <NativeSelect
          id="native-select-04-filled"
          defaultValue="Maya Chen"
          className="w-full [&>select]:border-transparent [&>select]:bg-muted [&>select]:hover:bg-muted/70"
        >
          {assignees.map((assignee) => (
            <NativeSelectOption key={assignee} value={assignee}>
              {assignee}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="native-select-04-underline">Team</Label>
        <NativeSelect
          id="native-select-04-underline"
          defaultValue="Platform"
          className="w-full [&>select]:rounded-none [&>select]:border-0 [&>select]:border-b [&>select]:bg-transparent [&>select]:pl-0 [&>select]:focus-visible:shadow-[0_1px_0_var(--color-ring)] [&>select]:focus-visible:ring-0 [&>svg]:right-0"
        >
          {teams.map((team) => (
            <NativeSelectOption key={team} value={team}>
              {team}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg border border-border bg-card px-3 py-2">
        <span className="text-sm font-medium">48 conversations</span>
        <div className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
          <Label
            htmlFor="native-select-04-ghost"
            className="font-normal text-muted-foreground"
          >
            Sort
          </Label>
          <NativeSelect
            id="native-select-04-ghost"
            size="sm"
            defaultValue="Newest first"
            className="[&>select]:border-transparent [&>select]:bg-transparent [&>select]:font-medium [&>select]:text-foreground [&>select]:hover:bg-accent"
          >
            {sortOrders.map((order) => (
              <NativeSelectOption key={order} value={order}>
                {order}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>
    </div>
  );
}
