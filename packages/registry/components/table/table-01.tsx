"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";

const limits = [
  { plan: "Hobby", requests: "60 / min", burst: "120", concurrency: "2" },
  { plan: "Team", requests: "600 / min", burst: "1,200", concurrency: "10" },
  {
    plan: "Business",
    requests: "3,000 / min",
    burst: "6,000",
    concurrency: "50",
  },
  {
    plan: "Enterprise",
    requests: "Custom",
    burst: "Custom",
    concurrency: "Custom",
  },
];

export default function Table01() {
  return (
    <div className="w-full max-w-lg">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="border-r px-2 sm:px-3">Plan</TableHead>
              <TableHead className="border-r px-1.5 text-right sm:px-3">
                Requests
              </TableHead>
              <TableHead className="hidden border-r px-3 text-right sm:table-cell">
                Burst
              </TableHead>
              <TableHead className="px-1.5 text-right sm:px-3">
                Concurrency
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {limits.map((row) => (
              <TableRow key={row.plan}>
                <TableCell className="border-r px-2 font-medium sm:px-3">
                  {row.plan}
                </TableCell>
                <TableCell className="border-r px-1.5 text-right tabular-nums sm:px-3">
                  {row.requests}
                </TableCell>
                <TableCell className="hidden border-r px-3 text-right tabular-nums sm:table-cell">
                  {row.burst}
                </TableCell>
                <TableCell className="px-1.5 text-right tabular-nums sm:px-3">
                  {row.concurrency}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        API rate limits per workspace, reset every 60 seconds.
      </p>
    </div>
  );
}
