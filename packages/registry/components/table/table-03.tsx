"use client";

import { cn } from "cn";
import { Rows2, Rows3, Rows4 } from "lucide-react";
import * as React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Density = "compact" | "default" | "comfortable";

const densities: { value: Density; label: string; icon: typeof Rows4 }[] = [
  { value: "compact", label: "Compact", icon: Rows4 },
  { value: "default", label: "Default", icon: Rows3 },
  { value: "comfortable", label: "Comfortable", icon: Rows2 },
];

const cellPadding: Record<Density, string> = {
  compact: "px-2 py-1 text-xs",
  default: "px-2 py-2",
  comfortable: "px-3 py-3.5",
};

const headHeight: Record<Density, string> = {
  compact: "h-8 text-xs",
  default: "h-10",
  comfortable: "h-12 px-3",
};

const stock = [
  { sku: "BK-2041", name: "Linen notebook, A5", bin: "A-03", onHand: 412 },
  { sku: "PN-1180", name: "Gel pen, 0.5 mm black", bin: "A-07", onHand: 1286 },
  { sku: "TP-0932", name: "Washi tape, sage", bin: "B-12", onHand: 94 },
  { sku: "ST-5510", name: "Brass desk stapler", bin: "C-01", onHand: 37 },
  { sku: "EN-7702", name: "Kraft envelopes, 50 pk", bin: "B-04", onHand: 258 },
];

export default function Table03() {
  const [density, setDensity] = React.useState<Density>("default");

  return (
    <div className="w-full max-w-lg space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p id="table-03-density" className="text-sm font-medium">
          Row density
        </p>
        <ToggleGroup
          aria-labelledby="table-03-density"
          variant="outline"
          size="sm"
          spacing={0}
          value={[density]}
          onValueChange={(value) => {
            if (value[0]) setDensity(value[0] as Density);
          }}
        >
          {densities.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              aria-label={option.label}
              title={option.label}
            >
              <option.icon aria-hidden="true" />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={headHeight[density]}>SKU</TableHead>
              <TableHead className={headHeight[density]}>Product</TableHead>
              <TableHead
                className={cn("hidden sm:table-cell", headHeight[density])}
              >
                Bin
              </TableHead>
              <TableHead className={cn("text-right", headHeight[density])}>
                On hand
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stock.map((item) => (
              <TableRow key={item.sku}>
                <TableCell
                  className={cn(
                    "font-mono text-muted-foreground",
                    cellPadding[density],
                  )}
                >
                  {item.sku}
                </TableCell>
                <TableCell
                  className={cn(
                    "font-medium whitespace-normal sm:whitespace-nowrap",
                    cellPadding[density],
                  )}
                >
                  {item.name}
                </TableCell>
                <TableCell
                  className={cn("hidden sm:table-cell", cellPadding[density])}
                >
                  {item.bin}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right tabular-nums",
                    cellPadding[density],
                  )}
                >
                  {item.onHand.toLocaleString("en-US")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
