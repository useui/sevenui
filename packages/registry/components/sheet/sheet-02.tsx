"use client";

import * as React from "react";
import { CheckIcon, DownloadIcon } from "lucide-react";
import { cn } from "cn";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Separator } from "@/registry/base/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/base/ui/sheet";

const sizes = [
  {
    label: "Compact",
    width: "max-w-xs",
    className: "data-[side=right]:sm:max-w-xs",
    wide: false,
  },
  {
    label: "Default",
    width: "max-w-sm",
    className: "data-[side=right]:sm:max-w-sm",
    wide: false,
  },
  {
    label: "Wide",
    width: "max-w-xl",
    className: "data-[side=right]:sm:max-w-xl",
    wide: true,
  },
];

const invoice = [
  { label: "Customer", value: "Northwind Logistics" },
  { label: "Issued", value: "Sep 2, 2026" },
  { label: "Due", value: "Oct 2, 2026" },
  { label: "Payment method", value: "Visa ending 4242" },
];

const lines = [
  { item: "Team plan, 12 seats", amount: "$576.00" },
  { item: "Additional storage, 200 GB", amount: "$40.00" },
  { item: "Priority support", amount: "$99.00" },
];

// Simulated export: shows progress, then a confirmation that resets itself.
function DownloadButton() {
  const [status, setStatus] = React.useState<"idle" | "working" | "done">(
    "idle",
  );
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const download = () => {
    if (status !== "idle") return;
    setStatus("working");
    timer.current = setTimeout(() => {
      setStatus("done");
      timer.current = setTimeout(() => setStatus("idle"), 2000);
    }, 800);
  };

  return (
    <Button onClick={download} aria-live="polite">
      {status === "done" ? (
        <CheckIcon aria-hidden="true" data-icon="inline-start" />
      ) : (
        <DownloadIcon aria-hidden="true" data-icon="inline-start" />
      )}
      {status === "working"
        ? "Preparing PDF…"
        : status === "done"
          ? "Downloaded"
          : "Download PDF"}
    </Button>
  );
}

export default function Sheet02() {
  return (
    <div className="grid w-full max-w-xs gap-2 sm:max-w-md sm:grid-cols-3">
      {sizes.map((size) => (
        <Sheet key={size.label}>
          <SheetTrigger
            render={
              <Button variant="outline" className="h-auto flex-col py-2">
                <span>{size.label}</span>
                <span className="font-normal text-muted-foreground text-xs">
                  {size.width}
                </span>
              </Button>
            }
          />
          <SheetContent className={cn("gap-0", size.className)}>
            <SheetHeader className="pr-12">
              <div className="flex items-center gap-2">
                <SheetTitle>Invoice INV-2041</SheetTitle>
                <Badge variant="secondary">Paid</Badge>
              </div>
              <SheetDescription>
                {size.label} width, {size.width} from the small breakpoint up.
              </SheetDescription>
            </SheetHeader>
            <div
              className={cn(
                "grid flex-1 content-start gap-6 overflow-y-auto px-4 pb-4",
                size.wide && "sm:grid-cols-[1fr_1.4fr]",
              )}
            >
              <dl className="grid content-start gap-3">
                {invoice.map((row) => (
                  <div key={row.label} className="grid gap-0.5">
                    <dt className="text-muted-foreground text-xs">
                      {row.label}
                    </dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="grid content-start gap-3 self-start rounded-lg border p-3">
                {lines.map((line) => (
                  <div key={line.item} className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{line.item}</span>
                    <span className="tabular-nums">{line.amount}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between gap-4 font-medium">
                  <span>Total</span>
                  <span className="tabular-nums">$715.00</span>
                </div>
              </div>
            </div>
            <SheetFooter className="border-t sm:flex-row sm:justify-end">
              <SheetClose render={<Button variant="outline">Close</Button>} />
              <DownloadButton />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  );
}
