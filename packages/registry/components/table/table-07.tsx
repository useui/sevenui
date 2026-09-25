"use client";

import { cn } from "cn";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";

type Rep = {
  name: string;
  deals: number;
  revenue: number;
  winRate: number;
};

type SortKey = keyof Rep;
type SortDirection = "ascending" | "descending";

const reps: Rep[] = [
  { name: "Grace Kim", deals: 31, revenue: 412_800, winRate: 38 },
  { name: "Marcus Hale", deals: 24, revenue: 486_250, winRate: 44 },
  { name: "Lucia Ortega", deals: 42, revenue: 298_400, winRate: 29 },
  { name: "Tomás Novak", deals: 18, revenue: 351_900, winRate: 51 },
  { name: "Aisha Bello", deals: 27, revenue: 267_300, winRate: 33 },
];

const columns: { key: SortKey; label: string; numeric: boolean }[] = [
  { key: "name", label: "Rep", numeric: false },
  { key: "revenue", label: "Revenue", numeric: true },
  { key: "deals", label: "Deals", numeric: true },
  { key: "winRate", label: "Win rate", numeric: true },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function Table07() {
  const [sort, setSort] = React.useState<{
    key: SortKey;
    direction: SortDirection;
  }>({ key: "revenue", direction: "descending" });

  const rows = React.useMemo(() => {
    const factor = sort.direction === "ascending" ? 1 : -1;
    return [...reps].sort((a, b) => {
      const left = a[sort.key];
      const right = b[sort.key];
      if (typeof left === "string" && typeof right === "string") {
        return left.localeCompare(right) * factor;
      }
      return ((left as number) - (right as number)) * factor;
    });
  }, [sort]);

  function toggleSort(key: SortKey, numeric: boolean) {
    setSort((current) =>
      current.key === key
        ? {
            key,
            direction:
              current.direction === "ascending" ? "descending" : "ascending",
          }
        : { key, direction: numeric ? "descending" : "ascending" },
    );
  }

  return (
    <div className="w-full max-w-xl">
      <Table>
        <TableCaption>Closed-won deals by rep, Q3 2026.</TableCaption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => {
              const active = sort.key === column.key;
              const Icon = !active
                ? ChevronsUpDown
                : sort.direction === "ascending"
                  ? ArrowUp
                  : ArrowDown;
              return (
                <TableHead
                  key={column.key}
                  aria-sort={active ? sort.direction : "none"}
                  className={cn(
                    column.numeric && "text-right",
                    column.key === "deals" && "hidden sm:table-cell",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(column.key, column.numeric)}
                    className={cn(
                      "-mx-1.5 inline-flex h-7 items-center gap-1 rounded-md px-1.5 text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                      active && "text-foreground",
                      column.numeric && "flex-row-reverse",
                    )}
                  >
                    {column.label}
                    <Icon
                      aria-hidden="true"
                      className={cn("size-3.5", !active && "opacity-50")}
                    />
                  </button>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((rep) => (
            <TableRow key={rep.name}>
              <TableCell className="font-medium whitespace-normal sm:whitespace-nowrap">
                {rep.name}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {currency.format(rep.revenue)}
              </TableCell>
              <TableCell className="hidden text-right tabular-nums sm:table-cell">
                {rep.deals}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {rep.winRate}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
