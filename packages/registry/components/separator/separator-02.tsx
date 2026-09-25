"use client";

import { Separator } from "@/registry/base/ui/separator";

const lines = [
  { label: "Team plan, 8 seats", amount: "$96.00" },
  { label: "Extra storage, 200 GB", amount: "$12.00" },
  { label: "Priority support", amount: "$25.00" },
];

const totals = [
  { label: "Subtotal", amount: "$133.00" },
  { label: "Annual discount", amount: "-$13.30" },
  { label: "Sales tax (8.25%)", amount: "$9.88" },
];

// Stroke variants built on the same primitive: the line is drawn with a
// border instead of the default background, so its style can change.
const dotted =
  "flex-1 self-end bg-transparent border-b-2 border-dotted border-border mb-1 data-[orientation=horizontal]:h-0 data-[orientation=horizontal]:w-auto";
const dashed =
  "bg-transparent border-t border-dashed border-border data-[orientation=horizontal]:h-0";
const double =
  "bg-transparent border-y border-foreground/70 data-[orientation=horizontal]:h-[3px]";

export default function Separator02() {
  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-5 text-card-foreground shadow-xs">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-medium">Invoice INV-2048</h3>
        <span className="text-xs text-muted-foreground">Sep 1, 2026</span>
      </div>
      <Separator className="my-4" />
      <ul className="flex flex-col gap-2.5 text-sm">
        {lines.map((line) => (
          <li key={line.label} className="flex items-baseline gap-2">
            <span className="min-w-0 truncate">{line.label}</span>
            <Separator className={dotted} />
            <span className="tabular-nums">{line.amount}</span>
          </li>
        ))}
      </ul>
      <Separator className={`my-4 ${dashed}`} />
      <dl className="flex flex-col gap-1.5 text-sm text-muted-foreground">
        {totals.map((row) => (
          <div key={row.label} className="flex justify-between gap-4">
            <dt>{row.label}</dt>
            <dd className="tabular-nums">{row.amount}</dd>
          </div>
        ))}
      </dl>
      <Separator className={`mt-4 mb-3 ${double}`} />
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-medium">Amount due</span>
        <span className="text-lg font-semibold tabular-nums">$129.58</span>
      </div>
    </div>
  );
}
