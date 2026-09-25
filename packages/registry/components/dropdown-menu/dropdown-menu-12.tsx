"use client";

import * as React from "react";
import {
  CalendarSync,
  CreditCard,
  FileDown,
  MoreHorizontal,
  PauseCircle,
  PlayCircle,
  XCircle,
} from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";

const cycles = {
  monthly: { label: "Monthly", price: "$48", per: "/month", renews: "Renews Oct 14" },
  annual: { label: "Annual", price: "$460", per: "/year", renews: "Renews Oct 14, 2027" },
} as const;

const pauseOptions = [
  { months: 1, resumes: "Nov 14" },
  { months: 2, resumes: "Dec 14" },
  { months: 3, resumes: "Jan 14" },
];

type Cycle = keyof typeof cycles;
type Status = "active" | "paused" | "canceling";

export default function DropdownMenu12() {
  const [cycle, setCycle] = React.useState<Cycle>("monthly");
  const [status, setStatus] = React.useState<Status>("active");
  const [resumes, setResumes] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const plan = cycles[cycle];

  const statusBadge =
    status === "canceling" ? (
      <Badge variant="destructive">Ends Oct 14</Badge>
    ) : (
      <Badge variant="outline" className="gap-1.5">
        <span
          aria-hidden="true"
          className={`size-1.5 rounded-full ${status === "active" ? "bg-success" : "bg-warning"}`}
        />
        {status === "active" ? "Active" : "Paused"}
      </Badge>
    );

  return (
    <section
      aria-labelledby="dropdown-menu-12-title"
      className="w-full max-w-sm rounded-xl border border-border bg-card text-card-foreground shadow-xs"
    >
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 id="dropdown-menu-12-title" className="text-sm font-medium">
              Growth plan
            </h3>
            {statusBadge}
          </div>
          <p className="text-2xl font-semibold tabular-nums">
            {plan.price}
            <span className="text-sm font-normal text-muted-foreground">
              {plan.per}
            </span>
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="icon-sm" aria-label="Manage subscription">
                <MoreHorizontal aria-hidden="true" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Billing cycle</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={cycle}
                onValueChange={(value) => {
                  setCycle(value as Cycle);
                  setNotice(
                    value === "annual"
                      ? "Switched to annual billing. You save $116 a year."
                      : "Switched to monthly billing from your next invoice.",
                  );
                }}
              >
                <DropdownMenuRadioItem value="monthly" closeOnClick>
                  Monthly
                  <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                    $48
                  </span>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="annual" closeOnClick>
                  Annual
                  <span className="ml-auto text-xs font-medium text-muted-foreground">Save 20%</span>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setNotice("Opening payment method settings…")}>
              <CreditCard aria-hidden="true" />
              Update payment method
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setNotice("Invoice INV-2026-0914 downloaded.")}>
              <FileDown aria-hidden="true" />
              Download last invoice
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {status === "active" ? (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <PauseCircle aria-hidden="true" />
                  Pause subscription
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48">
                  {pauseOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.months}
                      onClick={() => {
                        setStatus("paused");
                        setResumes(option.resumes);
                        setNotice(`Billing paused. It resumes on ${option.resumes}.`);
                      }}
                    >
                      {option.months} {option.months === 1 ? "month" : "months"}
                      <span className="ml-auto text-xs text-muted-foreground">
                        until {option.resumes}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            ) : (
              <DropdownMenuItem
                onClick={() => {
                  setStatus("active");
                  setResumes("");
                  setNotice("Subscription resumed. Next charge on Oct 14.");
                }}
              >
                <PlayCircle aria-hidden="true" />
                Resume subscription
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              variant="destructive"
              disabled={status === "canceling"}
              onClick={() => {
                setStatus("canceling");
                setNotice("Your plan stays active until Oct 14, then ends.");
              }}
            >
              <XCircle aria-hidden="true" />
              Cancel subscription
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <dl className="grid grid-cols-2 gap-3 border-t border-border px-4 py-3 text-xs">
        <div className="flex flex-col gap-0.5">
          <dt className="text-muted-foreground">Billing</dt>
          <dd className="flex items-center gap-1.5 font-medium">
            <CalendarSync aria-hidden="true" className="size-3.5 text-muted-foreground" />
            {plan.label}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-muted-foreground">
            {status === "paused" ? "Resumes" : "Next charge"}
          </dt>
          <dd className="font-medium">
            {status === "paused"
              ? resumes
              : status === "canceling"
                ? "None"
                : plan.renews.replace("Renews ", "")}
          </dd>
        </div>
        <div className="col-span-2 flex flex-col gap-0.5">
          <dt className="text-muted-foreground">Payment method</dt>
          <dd className="font-medium">Visa ending 4242</dd>
        </div>
      </dl>

      <p
        aria-live="polite"
        className="min-h-9 border-t border-border px-4 py-2.5 text-xs text-muted-foreground"
      >
        {notice || "3 seats · 12,000 tracked events included per month."}
      </p>
    </section>
  );
}
