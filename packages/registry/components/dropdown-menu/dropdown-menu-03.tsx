"use client";

import * as React from "react";
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";

const SORT_FIELDS = [
  { value: "updated", label: "Last updated" },
  { value: "created", label: "Date created" },
  { value: "name", label: "Name" },
  { value: "size", label: "File size" },
] as const;

type SortField = (typeof SORT_FIELDS)[number]["value"];
type SortDirection = "asc" | "desc";

export default function DropdownMenu03() {
  const [field, setField] = React.useState<SortField>("updated");
  const [direction, setDirection] = React.useState<SortDirection>("desc");
  const current = SORT_FIELDS.find((option) => option.value === field) ?? SORT_FIELDS[0];
  const DirectionIcon = direction === "asc" ? ArrowUpNarrowWide : ArrowDownWideNarrow;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline">
            <DirectionIcon aria-hidden="true" data-icon="inline-start" />
            <span className="text-muted-foreground">Sort:</span>
            {current.label}
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuRadioGroup
          value={field}
          onValueChange={(value) => setField(value as SortField)}
        >
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          {SORT_FIELDS.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={direction}
          onValueChange={(value) => setDirection(value as SortDirection)}
        >
          <DropdownMenuLabel>Order</DropdownMenuLabel>
          <DropdownMenuRadioItem value="asc">
            <ArrowUpNarrowWide aria-hidden="true" />
            Ascending
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="desc">
            <ArrowDownWideNarrow aria-hidden="true" />
            Descending
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
