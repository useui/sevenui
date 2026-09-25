"use client";

import * as React from "react";
import { FlaskConical, KeyRound } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";

const statusVariant: Record<string, "secondary" | "destructive" | "outline"> = {
  Succeeded: "secondary",
  Declined: "destructive",
  Refunded: "outline",
};

const data = {
  live: {
    key: "pk_live_51Nw…Qe8R",
    volume: "$48,210.90",
    payments: [
      { id: "py_3", customer: "Harbor Coffee Co.", amount: "$1,240.00", status: "Succeeded" },
      { id: "py_2", customer: "Lumen Studio", amount: "$89.00", status: "Succeeded" },
      { id: "py_1", customer: "Oakline Dental", amount: "$410.50", status: "Refunded" },
    ],
  },
  test: {
    key: "pk_test_51Nw…7xKd",
    volume: "$1,337.00",
    payments: [
      { id: "py_t3", customer: "Test card 4242", amount: "$1,000.00", status: "Succeeded" },
      { id: "py_t2", customer: "Test card 0002", amount: "$250.00", status: "Declined" },
      { id: "py_t1", customer: "Test card 3155", amount: "$87.00", status: "Succeeded" },
    ],
  },
};

export default function Switch07() {
  const [testMode, setTestMode] = React.useState(false);
  const current = testMode ? data.test : data.live;

  return (
    <section
      aria-labelledby="switch-07-title"
      className={
        testMode
          ? "w-full max-w-md overflow-hidden rounded-xl border border-warning bg-card text-card-foreground transition-colors"
          : "w-full max-w-md overflow-hidden rounded-xl border border-border bg-card text-card-foreground transition-colors"
      }
    >
      <div
        role="status"
        className={
          testMode
            ? "flex items-center gap-2 bg-warning px-4 py-1.5 text-xs font-medium text-warning-foreground"
            : "sr-only"
        }
      >
        {testMode ? (
          <>
            <FlaskConical aria-hidden="true" className="size-3.5 shrink-0" />
            Test data. Nothing here moves real money.
          </>
        ) : (
          "Showing live data."
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <div className="flex flex-col gap-0.5">
          <h3 id="switch-07-title" className="font-medium">
            Payments
          </h3>
          <p className="text-sm text-muted-foreground">
            Last 7 days ·{" "}
            <span className="font-medium text-foreground tabular-nums">{current.volume}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="switch-07-mode">Test mode</Label>
          <Switch
            id="switch-07-mode"
            checked={testMode}
            onCheckedChange={setTestMode}
            className="data-checked:bg-warning"
          />
        </div>
      </div>

      <ul aria-label="Recent payments" className="flex flex-col divide-y divide-border">
        {current.payments.map((payment) => (
          <li key={payment.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <div className="flex min-w-0 flex-1 flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3">
              <span className="max-w-full min-w-0 truncate text-sm">{payment.customer}</span>
              <Badge variant={statusVariant[payment.status]} className="sm:ml-auto">
                {payment.status}
              </Badge>
            </div>
            <span className="w-20 shrink-0 text-right text-sm tabular-nums">{payment.amount}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2 border-t border-border bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
        <KeyRound aria-hidden="true" className="size-3.5 shrink-0" />
        <span>Publishable key</span>
        <code className="ml-auto truncate font-mono text-foreground">{current.key}</code>
      </div>
    </section>
  );
}
