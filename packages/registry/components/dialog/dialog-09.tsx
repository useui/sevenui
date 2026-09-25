"use client";

import * as React from "react";
import { ArrowLeft, Check, Globe } from "lucide-react";
import { cn } from "cn";

import { Button } from "@/registry/base/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/base/ui/dialog";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

const steps = [
  {
    title: "Add your domain",
    description: "Enter the domain you want visitors to use.",
  },
  {
    title: "Update DNS records",
    description: "Add these records at your domain provider.",
  },
  {
    title: "Ready to verify",
    description: "DNS changes can take up to an hour to propagate.",
  },
];

const records = [
  { type: "A", name: "@", value: "76.76.21.21" },
  { type: "CNAME", name: "www", value: "cname.sevenhost.net" },
];

export default function Dialog09() {
  const [step, setStep] = React.useState(0);
  const [direction, setDirection] = React.useState<"forward" | "back">(
    "forward",
  );
  const [domain, setDomain] = React.useState("store.acme.co");
  const [connected, setConnected] = React.useState<string | null>(null);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  const go = (next: number) => {
    setDirection(next > step ? "forward" : "back");
    setStep(next);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Dialog
        onOpenChangeComplete={(open) => {
          // Start from the first step next time the dialog opens.
          if (!open) {
            setStep(0);
            setDirection("forward");
          }
        }}
      >
        <DialogTrigger
          render={
            <Button variant="outline">
              <Globe aria-hidden="true" data-icon="inline-start" />
              Connect domain
            </Button>
          }
        />
        <DialogContent className="overflow-hidden sm:max-w-md">
          <div className="flex items-center gap-3 pr-8">
            <ol aria-label="Progress" className="flex flex-1 items-center gap-1.5">
              {steps.map((item, index) => (
                <li
                  key={item.title}
                  aria-current={index === step ? "step" : undefined}
                  className={cn(
                    "h-1 flex-1 rounded-full bg-muted transition-colors duration-300",
                    index <= step && "bg-primary",
                  )}
                >
                  <span className="sr-only">
                    {item.title}
                    {index < step ? " (completed)" : ""}
                  </span>
                </li>
              ))}
            </ol>
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {step + 1} of {steps.length}
            </span>
          </div>
          <div
            key={step}
            className={cn(
              "grid gap-4 duration-200 ease-out animate-in fade-in-0",
              direction === "forward"
                ? "slide-in-from-right-4"
                : "slide-in-from-left-4",
            )}
          >
            <DialogHeader>
              <DialogTitle>{current.title}</DialogTitle>
              <DialogDescription>{current.description}</DialogDescription>
            </DialogHeader>
            {step === 0 && (
              <div className="grid gap-2">
                <Label htmlFor="dialog-09-domain">Domain</Label>
                <Input
                  id="dialog-09-domain"
                  value={domain}
                  onChange={(event) => setDomain(event.target.value)}
                  placeholder="shop.example.com"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            )}
            {step === 1 && (
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full table-fixed text-left text-sm">
                  <thead className="bg-muted/50 text-xs text-muted-foreground">
                    <tr>
                      <th scope="col" className="w-16 px-3 py-2 font-medium">
                        Type
                      </th>
                      <th scope="col" className="w-14 px-3 py-2 font-medium">
                        Name
                      </th>
                      <th scope="col" className="px-3 py-2 font-medium">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.type} className="border-t">
                        <td className="px-3 py-2 font-medium">{record.type}</td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {record.name}
                        </td>
                        <td className="truncate px-3 py-2 font-mono text-xs select-all">
                          {record.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {step === 2 && (
              <div className="flex items-center gap-3 rounded-lg bg-muted/60 p-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check aria-hidden="true" className="size-4" />
                </div>
                <div className="grid min-w-0 text-sm">
                  <span className="truncate font-medium">
                    {domain.trim() || "Your domain"}
                  </span>
                  <span className="text-muted-foreground">
                    2 records configured
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="sm:justify-between">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => go(step - 1)}>
                <ArrowLeft aria-hidden="true" data-icon="inline-start" />
                Back
              </Button>
            ) : (
              <DialogClose render={<Button variant="ghost">Cancel</Button>} />
            )}
            {isLast ? (
              <DialogClose
                render={
                  <Button onClick={() => setConnected(domain.trim())}>
                    Verify domain
                  </Button>
                }
              />
            ) : (
              <Button
                onClick={() => go(step + 1)}
                disabled={step === 0 && domain.trim().length === 0}
              >
                Continue
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {connected ? (
          <>
            Verifying{" "}
            <span className="font-medium text-foreground">{connected}</span>.
            This can take up to an hour.
          </>
        ) : (
          "No custom domain connected."
        )}
      </p>
    </div>
  );
}
