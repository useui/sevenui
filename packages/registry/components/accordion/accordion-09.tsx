"use client";

import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleXIcon,
  RotateCwIcon,
} from "lucide-react";
import * as React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/base/ui/accordion";
import { Button } from "@/registry/base/ui/button";
import { Spinner } from "@/registry/base/ui/spinner";

type Status = "passed" | "warning" | "failed" | "running";

type Check = {
  value: string;
  name: string;
  status: Status;
  duration: string;
  log: string;
};

const initialChecks: Check[] = [
  {
    value: "lint",
    name: "Lint and format",
    status: "passed",
    duration: "18s",
    log: "Checked 412 files. No issues found.",
  },
  {
    value: "types",
    name: "Type check",
    status: "warning",
    duration: "42s",
    log: "2 deprecation warnings in src/billing/invoice.ts.\n'formatAmount' is deprecated, use 'formatMoney'.",
  },
  {
    value: "tests",
    name: "Unit tests",
    status: "failed",
    duration: "1m 36s",
    log: "FAIL checkout/cart.test.ts\n  applies percentage discount\n  Expected: 90.00\n  Received: 89.99",
  },
  {
    value: "e2e",
    name: "End-to-end tests",
    status: "running",
    duration: "2m 10s",
    log: "",
  },
];

const statusLabel: Record<Status, string> = {
  passed: "Passed",
  warning: "Passed with warnings",
  failed: "Failed",
  running: "In progress",
};

function StatusIcon({ status }: { status: Status }) {
  if (status === "running") {
    return (
      <Spinner
        aria-label="Running"
        className="text-muted-foreground"
      />
    );
  }
  const Icon =
    status === "passed"
      ? CircleCheckIcon
      : status === "warning"
        ? CircleAlertIcon
        : CircleXIcon;
  const tone =
    status === "passed"
      ? "text-success"
      : status === "warning"
        ? "text-warning"
        : "text-destructive";
  return <Icon className={`size-4 shrink-0 ${tone}`} aria-hidden="true" />;
}

export default function Accordion09() {
  const [checks, setChecks] = React.useState(initialChecks);
  const [rerunning, setRerunning] = React.useState<string | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const passing = checks.filter(
    (check) => check.status === "passed" || check.status === "warning",
  ).length;

  // Simulates re-running a failed job: it spins for a moment, then comes back
  // green with a fresh log.
  function rerun(value: string) {
    setRerunning(value);
    timer.current = setTimeout(() => {
      setChecks((current) =>
        current.map((check) =>
          check.value === value
            ? {
                ...check,
                status: "passed",
                duration: "1m 41s",
                log: "PASS checkout/cart.test.ts\n  applies percentage discount\nTests: 128 passed, 128 total",
              }
            : check,
        ),
      );
      setRerunning(null);
    }, 1500);
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Checks for fix/cart-rounding</h3>
        <span
          aria-live="polite"
          className="text-xs text-muted-foreground tabular-nums"
        >
          {passing} of {checks.length} passing
        </span>
      </div>
      <Accordion defaultValue={["tests"]} className="rounded-xl border">
        {checks.map((check) => {
          const isRerunning = rerunning === check.value;
          return (
          <AccordionItem
            key={check.value}
            value={check.value}
            disabled={check.status === "running"}
          >
            <AccordionTrigger className="items-center gap-3 rounded-none px-4 hover:no-underline aria-disabled:opacity-100">
              <StatusIcon status={isRerunning ? "running" : check.status} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate">{check.name}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {isRerunning ? "Re-running" : statusLabel[check.status]}
                </span>
              </span>
              <span className="text-xs font-normal text-muted-foreground tabular-nums">
                {check.duration}
              </span>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col items-start gap-3 px-4 pb-4">
              <pre className="w-full overflow-x-auto rounded-lg bg-muted px-3 py-2 font-mono text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground">
                {check.log}
              </pre>
              {check.status === "failed" ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isRerunning}
                  onClick={() => rerun(check.value)}
                >
                  {isRerunning ? (
                    <Spinner data-icon="inline-start" />
                  ) : (
                    <RotateCwIcon aria-hidden="true" data-icon="inline-start" />
                  )}
                  {isRerunning ? "Re-running tests" : "Re-run failed tests"}
                </Button>
              ) : null}
            </AccordionContent>
          </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
