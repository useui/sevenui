"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";

const lines = [
  { description: "Brand strategy workshop", qty: 1, rate: 3200 },
  { description: "Logo and identity system", qty: 1, rate: 5400 },
  { description: "Marketing site design, per page", qty: 6, rate: 850 },
  { description: "Design QA, hours", qty: 14, rate: 120 },
];

const TAX_RATE = 0.08;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function Table04() {
  const subtotal = lines.reduce((sum, line) => sum + line.qty * line.rate, 0);
  const tax = subtotal * TAX_RATE;

  return (
    <div className="w-full max-w-xl">
      <Table>
        <TableCaption>Invoice INV-2291 · due October 15, 2026</TableCaption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="hidden text-right sm:table-cell">
              Rate
            </TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.map((line) => (
            <TableRow key={line.description}>
              <TableCell className="whitespace-normal">
                {line.description}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {line.qty}
              </TableCell>
              <TableCell className="hidden text-right text-muted-foreground tabular-nums sm:table-cell">
                {currency.format(line.rate)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {currency.format(line.qty * line.rate)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className="bg-transparent">
          <TableRow className="border-0 font-normal text-muted-foreground hover:bg-transparent">
            <TableCell colSpan={2}>Subtotal</TableCell>
            <TableCell className="hidden sm:table-cell" />
            <TableCell className="text-right tabular-nums">
              {currency.format(subtotal)}
            </TableCell>
          </TableRow>
          <TableRow className="font-normal text-muted-foreground hover:bg-transparent">
            <TableCell colSpan={2}>Sales tax (8%)</TableCell>
            <TableCell className="hidden sm:table-cell" />
            <TableCell className="text-right tabular-nums">
              {currency.format(tax)}
            </TableCell>
          </TableRow>
          <TableRow className="bg-muted/50 text-base hover:bg-muted/50">
            <TableCell colSpan={2} className="font-semibold">
              Total due
            </TableCell>
            <TableCell className="hidden sm:table-cell" />
            <TableCell className="text-right font-semibold tabular-nums">
              {currency.format(subtotal + tax)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
