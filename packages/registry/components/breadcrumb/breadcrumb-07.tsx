"use client";

import { CircleAlert, RotateCw } from "lucide-react";
import { useId, useState } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/base/ui/breadcrumb";
import { Button } from "@/registry/base/ui/button";
import { Skeleton } from "@/registry/base/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Status = "loading" | "ready" | "error";

const states: { value: Status; label: string }[] = [
  { value: "loading", label: "Loading" },
  { value: "ready", label: "Ready" },
  { value: "error", label: "Error" },
];

const skeletonWidths = ["w-12 sm:w-14", "w-16 sm:w-20", "w-20 sm:w-28"];

const linkClassName =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function Breadcrumb07() {
  const [status, setStatus] = useState<Status>("loading");
  const labelId = useId();

  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          id={labelId}
          className="text-xs font-medium text-muted-foreground"
        >
          Preview state
        </span>
        <ToggleGroup
          aria-labelledby={labelId}
          variant="outline"
          size="sm"
          spacing={0}
          value={[status]}
          onValueChange={(next) => {
            if (next.length > 0) setStatus(next[0] as Status);
          }}
        >
          {states.map((state) => (
            <ToggleGroupItem key={state.value} value={state.value}>
              {state.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="flex min-h-9 items-center rounded-lg border border-dashed border-border px-3 py-2">
        <Breadcrumb aria-busy={status === "loading"}>
          {status === "loading" ? (
            <BreadcrumbList>
              {skeletonWidths.map((width, index) => (
                <BreadcrumbItem key={width} className="gap-1.5">
                  {index > 0 ? (
                    <span
                      aria-hidden="true"
                      className="text-muted-foreground/40"
                    >
                      /
                    </span>
                  ) : null}
                  <Skeleton className={`h-4 ${width}`} />
                </BreadcrumbItem>
              ))}
              <li className="sr-only">Loading account location</li>
            </BreadcrumbList>
          ) : (
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#accounts" className={linkClassName}>
                  Accounts
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="#enterprise"
                  className={linkClassName}
                >
                  Enterprise
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
              <BreadcrumbItem>
                {status === "ready" ? (
                  <BreadcrumbPage className="font-medium">
                    Globex Corporation
                  </BreadcrumbPage>
                ) : (
                  <span className="inline-flex flex-wrap items-center gap-2">
                    <BreadcrumbPage className="inline-flex items-center gap-1.5 text-destructive">
                      <CircleAlert aria-hidden="true" className="size-3.5" />
                      Account name unavailable
                    </BreadcrumbPage>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setStatus("ready")}
                    >
                      <RotateCw aria-hidden="true" />
                      Retry
                    </Button>
                  </span>
                )}
              </BreadcrumbItem>
            </BreadcrumbList>
          )}
        </Breadcrumb>
      </div>
    </div>
  );
}
