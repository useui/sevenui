"use client";

import { cn } from "cn";
import { ChevronRight } from "lucide-react";
import * as React from "react";

import { Badge } from "@/registry/base/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";

type Deploy = {
  id: string;
  commit: string;
  message: string;
  author: string;
  status: "Ready" | "Failed";
  duration: string;
  steps: { name: string; duration: string; failed?: boolean }[];
};

const deploys: Deploy[] = [
  {
    id: "dpl_41c9",
    commit: "a3f91c2",
    message: "Add usage-based pricing page",
    author: "maya",
    status: "Ready",
    duration: "1m 42s",
    steps: [
      { name: "Install dependencies", duration: "18s" },
      { name: "Build", duration: "1m 06s" },
      { name: "Upload assets", duration: "11s" },
      { name: "Promote to production", duration: "7s" },
    ],
  },
  {
    id: "dpl_41c8",
    commit: "7be04d1",
    message: "Migrate auth callbacks to edge runtime",
    author: "daniel",
    status: "Failed",
    duration: "48s",
    steps: [
      { name: "Install dependencies", duration: "17s" },
      {
        name: "Build: type error in auth/callback.ts",
        duration: "31s",
        failed: true,
      },
    ],
  },
  {
    id: "dpl_41c7",
    commit: "0d2e6ab",
    message: "Fix trailing slash redirect on docs",
    author: "priya",
    status: "Ready",
    duration: "1m 38s",
    steps: [
      { name: "Install dependencies", duration: "16s" },
      { name: "Build", duration: "1m 04s" },
      { name: "Upload assets", duration: "10s" },
      { name: "Promote to production", duration: "8s" },
    ],
  },
];

export default function Table09() {
  const [expanded, setExpanded] = React.useState<string | null>("dpl_41c8");

  return (
    <div className="w-full max-w-xl rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10 pl-3">
              <span className="sr-only">Toggle details</span>
            </TableHead>
            <TableHead>Commit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden pr-3 text-right sm:table-cell">
              Duration
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deploys.map((deploy) => {
            const open = expanded === deploy.id;
            const panelId = `table-09-${deploy.id}`;
            return (
              <React.Fragment key={deploy.id}>
                <TableRow className={cn(open && "border-b-0")}>
                  <TableCell className="pl-3">
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={panelId}
                      aria-label={`${open ? "Hide" : "Show"} build steps for ${deploy.commit}`}
                      onClick={() => setExpanded(open ? null : deploy.id)}
                      className="flex size-6 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <ChevronRight
                        aria-hidden="true"
                        className={cn(
                          "size-4 transition-transform duration-200 ease-out motion-reduce:transition-none",
                          open && "rotate-90",
                        )}
                      />
                    </button>
                  </TableCell>
                  <TableCell className="whitespace-normal sm:max-w-72 sm:whitespace-nowrap">
                    <p className="font-medium sm:truncate">{deploy.message}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-mono">{deploy.commit}</span> by{" "}
                      {deploy.author}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        deploy.status === "Failed" ? "destructive" : "secondary"
                      }
                    >
                      {deploy.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden pr-3 text-right text-muted-foreground tabular-nums sm:table-cell">
                    {deploy.duration}
                  </TableCell>
                </TableRow>
                <TableRow
                  className={cn(
                    "bg-muted/40 hover:bg-muted/40",
                    !open && "border-0",
                  )}
                >
                  <TableCell colSpan={4} className="p-0 whitespace-normal">
                    <div
                      id={panelId}
                      inert={!open}
                      className={cn(
                        "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
                        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                      )}
                    >
                      <div className="overflow-hidden">
                        <ol className="space-y-1.5 py-3 pr-3 pl-12">
                          {deploy.steps.map((step) => (
                            <li
                              key={step.name}
                              className={cn(
                                "flex items-center justify-between gap-4 text-xs",
                                step.failed
                                  ? "text-destructive"
                                  : "text-muted-foreground",
                              )}
                            >
                              <span className="min-w-0">{step.name}</span>
                              <span className="font-mono tabular-nums">
                                {step.duration}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
