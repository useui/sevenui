"use client";

import { ScrollArea } from "@/registry/base/ui/scroll-area";

const columns = [
  "Region",
  "Requests",
  "p50",
  "p95",
  "p99",
  "Error rate",
  "Cache hit",
  "Bandwidth",
];

const rows = [
  [
    "us-east-1",
    "4.82M",
    "38 ms",
    "112 ms",
    "240 ms",
    "0.04%",
    "93.1%",
    "1.9 TB",
  ],
  [
    "us-west-2",
    "3.17M",
    "41 ms",
    "126 ms",
    "268 ms",
    "0.06%",
    "91.4%",
    "1.2 TB",
  ],
  [
    "eu-west-1",
    "2.94M",
    "44 ms",
    "131 ms",
    "281 ms",
    "0.05%",
    "92.7%",
    "1.1 TB",
  ],
  [
    "eu-central-1",
    "2.21M",
    "46 ms",
    "139 ms",
    "302 ms",
    "0.09%",
    "90.2%",
    "840 GB",
  ],
  [
    "ap-south-1",
    "1.88M",
    "63 ms",
    "188 ms",
    "410 ms",
    "0.21%",
    "86.5%",
    "702 GB",
  ],
  [
    "ap-southeast-1",
    "1.64M",
    "57 ms",
    "171 ms",
    "366 ms",
    "0.12%",
    "88.9%",
    "615 GB",
  ],
  [
    "ap-northeast-1",
    "1.52M",
    "52 ms",
    "158 ms",
    "329 ms",
    "0.08%",
    "89.8%",
    "580 GB",
  ],
  [
    "sa-east-1",
    "0.96M",
    "71 ms",
    "204 ms",
    "455 ms",
    "0.18%",
    "84.3%",
    "362 GB",
  ],
  [
    "ca-central-1",
    "0.81M",
    "40 ms",
    "119 ms",
    "252 ms",
    "0.03%",
    "92.2%",
    "298 GB",
  ],
  [
    "af-south-1",
    "0.37M",
    "88 ms",
    "246 ms",
    "521 ms",
    "0.33%",
    "80.6%",
    "141 GB",
  ],
  [
    "me-central-1",
    "0.29M",
    "79 ms",
    "221 ms",
    "478 ms",
    "0.26%",
    "82.1%",
    "109 GB",
  ],
];

export default function ScrollArea05() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-2">
      <h3 id="scroll-area-05-title" className="text-sm font-medium">
        Edge latency, last 24 hours
      </h3>
      <ScrollArea
        orientation="both"
        role="region"
        aria-labelledby="scroll-area-05-title"
        className="h-72 w-full rounded-lg border bg-card"
      >
        <table className="w-max min-w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column}
                  scope="col"
                  className={
                    index === 0
                      ? "sticky top-0 left-0 z-20 border-r border-b bg-muted px-3 py-2 text-left font-medium"
                      : "sticky top-0 z-10 border-b bg-muted px-3 py-2 text-right font-medium whitespace-nowrap"
                  }
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([region, ...values]) => (
              <tr key={region} className="group">
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-r border-b bg-card px-3 py-2 text-left font-mono text-xs font-normal group-last:border-b-0 group-hover:bg-muted"
                >
                  {region}
                </th>
                {values.map((value, index) => (
                  <td
                    key={columns[index + 1]}
                    className="border-b px-3 py-2 text-right whitespace-nowrap tabular-nums group-last:border-b-0 group-hover:bg-muted/60"
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
}
