"use client";

import * as React from "react";
import { Columns3 } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";

const COLUMNS = [
  { key: "status", label: "Status" },
  { key: "assignee", label: "Assignee" },
  { key: "dueDate", label: "Due date" },
  { key: "estimate", label: "Estimate" },
] as const;

type ColumnKey = (typeof COLUMNS)[number]["key"];

const DEFAULT_VISIBLE: Record<ColumnKey, boolean> = {
  status: true,
  assignee: true,
  dueDate: false,
  estimate: false,
};

export default function DropdownMenu02() {
  const [visible, setVisible] = React.useState(DEFAULT_VISIBLE);
  // The Title column is always shown, so it counts toward the total.
  const shown = 1 + Object.values(visible).filter(Boolean).length;
  const isDefault = COLUMNS.every(
    (column) => visible[column.key] === DEFAULT_VISIBLE[column.key],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline">
            <Columns3 aria-hidden="true" data-icon="inline-start" />
            View
            <span className="text-muted-foreground tabular-nums">
              {shown}/{COLUMNS.length + 1}
            </span>
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
          <DropdownMenuCheckboxItem checked disabled>
            Title
          </DropdownMenuCheckboxItem>
          {COLUMNS.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.key}
              checked={visible[column.key]}
              onCheckedChange={(checked) =>
                setVisible((prev) => ({ ...prev, [column.key]: checked }))
              }
            >
              {column.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isDefault}
          onClick={() => setVisible(DEFAULT_VISIBLE)}
        >
          Reset to default
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
