"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";

const regions = [
  {
    code: "iad1",
    city: "Washington, D.C.",
    p50: 18,
    p99: 64,
    uptime: "99.99%",
  },
  { code: "sfo1", city: "San Francisco", p50: 22, p99: 71, uptime: "99.98%" },
  { code: "gru1", city: "São Paulo", p50: 41, p99: 128, uptime: "99.95%" },
  { code: "lhr1", city: "London", p50: 16, p99: 58, uptime: "99.99%" },
  { code: "fra1", city: "Frankfurt", p50: 15, p99: 55, uptime: "99.99%" },
  { code: "cdg1", city: "Paris", p50: 17, p99: 60, uptime: "99.97%" },
  { code: "arn1", city: "Stockholm", p50: 19, p99: 66, uptime: "99.98%" },
  { code: "bom1", city: "Mumbai", p50: 38, p99: 117, uptime: "99.93%" },
  { code: "sin1", city: "Singapore", p50: 24, p99: 82, uptime: "99.97%" },
  { code: "hnd1", city: "Tokyo", p50: 21, p99: 73, uptime: "99.98%" },
  { code: "icn1", city: "Seoul", p50: 23, p99: 79, uptime: "99.96%" },
  { code: "syd1", city: "Sydney", p50: 29, p99: 94, uptime: "99.96%" },
  { code: "cpt1", city: "Cape Town", p50: 47, p99: 141, uptime: "99.91%" },
];

export default function Table02() {
  return (
    <div className="w-full max-w-lg">
      <div className="rounded-lg [&>[data-slot=table-container]]:max-h-72 [&>[data-slot=table-container]]:rounded-lg">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background shadow-[0_1px_0_var(--border)] [&_tr]:border-0">
            <TableRow className="hover:bg-transparent">
              <TableHead>Region</TableHead>
              <TableHead className="text-right">p50</TableHead>
              <TableHead className="text-right">p99</TableHead>
              <TableHead className="hidden text-right sm:table-cell">
                Uptime
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {regions.map((region) => (
              <TableRow
                key={region.code}
                className="border-0 even:bg-muted/50 hover:bg-accent"
              >
                <TableCell>
                  <span className="font-medium">{region.city}</span>
                  <span className="block font-mono text-xs text-muted-foreground sm:ml-2 sm:inline">
                    {region.code}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {region.p50} ms
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {region.p99} ms
                </TableCell>
                <TableCell className="hidden text-right tabular-nums sm:table-cell">
                  {region.uptime}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        Edge latency by region over the last 24 hours.
      </p>
    </div>
  );
}
