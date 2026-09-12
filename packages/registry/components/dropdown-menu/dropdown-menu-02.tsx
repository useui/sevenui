"use client";

import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";

const COLUMNS = [
  { key: "status", label: "Status" },
  { key: "assignee", label: "Assignee" },
  { key: "dueDate", label: "Due date" },
] as const;

type ColumnKey = (typeof COLUMNS)[number]["key"];

export default function DropdownMenu02() {
  const [visible, setVisible] = React.useState<Record<ColumnKey, boolean>>({
    status: true,
    assignee: true,
    dueDate: false,
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline">View options</Button>} />
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
