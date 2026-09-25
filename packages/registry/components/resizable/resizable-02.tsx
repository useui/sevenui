"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/registry/base/ui/resizable";

const query = [
  "select plan, count(*) as accounts",
  "from subscriptions",
  "where status = 'active'",
  "group by plan",
  "order by accounts desc;",
];

const rows = [
  { plan: "Team", accounts: "1,284" },
  { plan: "Starter", accounts: "962" },
  { plan: "Business", accounts: "317" },
  { plan: "Enterprise", accounts: "48" },
];

export default function Resizable02() {
  return (
    <div className="h-96 w-full max-w-md">
      <ResizablePanelGroup orientation="vertical">
        <ResizablePanel id="query" defaultSize="45%" minSize="25%">
          <section
            aria-label="Query"
            className="h-full overflow-hidden rounded-lg bg-muted/60 p-4"
          >
            <pre className="font-mono text-xs leading-6 text-foreground">
              {query.map((line, index) => (
                <div key={line} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="w-3 shrink-0 text-right text-muted-foreground tabular-nums select-none"
                  >
                    {index + 1}
                  </span>
                  <code className="truncate">{line}</code>
                </div>
              ))}
            </pre>
          </section>
        </ResizablePanel>
        <ResizableHandle
          aria-label="Resize query and results"
          className="bg-transparent before:h-1 before:w-10 before:rounded-full before:bg-border before:transition-colors aria-[orientation=horizontal]:h-3 data-[separator=active]:before:bg-primary data-[separator=focus]:before:bg-ring data-[separator=hover]:before:bg-muted-foreground/50"
        />
        <ResizablePanel id="results" defaultSize="55%" minSize="25%">
          <section
            aria-label="Results"
            className="flex h-full flex-col overflow-y-auto rounded-lg bg-muted/60"
          >
            <div className="flex items-center justify-between px-4 pt-3 pb-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">4 rows</span>
              <span className="tabular-nums">38 ms</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y text-left text-xs text-muted-foreground">
                  <th scope="col" className="px-4 py-1.5 font-medium">
                    plan
                  </th>
                  <th scope="col" className="px-4 py-1.5 text-right font-medium">
                    accounts
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.plan} className="border-b last:border-0">
                    <td className="px-4 py-1.5">{row.plan}</td>
                    <td className="px-4 py-1.5 text-right font-mono text-xs tabular-nums">
                      {row.accounts}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
