"use client";

import * as React from "react";

import { Checkbox } from "@/registry/base/ui/checkbox";
import { Label } from "@/registry/base/ui/label";

const teams = ["Design", "Engineering", "Product"];

export default function CheckboxIndeterminate() {
  const [checked, setChecked] = React.useState<string[]>(["Design"]);

  const allChecked = checked.length === teams.length;
  const indeterminate = checked.length > 0 && !allChecked;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Checkbox
          id="checkbox-all-teams"
          checked={allChecked}
          indeterminate={indeterminate}
          onCheckedChange={(value) => setChecked(value ? [...teams] : [])}
        />
        <Label htmlFor="checkbox-all-teams">All teams</Label>
      </div>
      <div className="flex flex-col gap-3 ps-6">
        {teams.map((team) => (
          <div key={team} className="flex items-center gap-2">
            <Checkbox
              id={`checkbox-team-${team.toLowerCase()}`}
              checked={checked.includes(team)}
              onCheckedChange={(value) =>
                setChecked((prev) =>
                  value ? [...prev, team] : prev.filter((item) => item !== team),
                )
              }
            />
            <Label htmlFor={`checkbox-team-${team.toLowerCase()}`}>{team}</Label>
          </div>
        ))}
      </div>
    </div>
  );
}
