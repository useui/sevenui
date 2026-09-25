"use client";

import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/registry/base/ui/pagination";

const TOTAL_PAGES = 36;

export default function Pagination04() {
  const [page, setPage] = React.useState(4);
  const isFirst = page === 1;
  const isLast = page === TOTAL_PAGES;

  const steps = [
    {
      label: "Go to first page",
      target: 1,
      disabled: isFirst,
      icon: ChevronsLeftIcon,
    },
    {
      label: "Go to previous page",
      target: page - 1,
      disabled: isFirst,
      icon: ChevronLeftIcon,
    },
  ];
  const forwardSteps = [
    {
      label: "Go to next page",
      target: page + 1,
      disabled: isLast,
      icon: ChevronRightIcon,
    },
    {
      label: "Go to last page",
      target: TOTAL_PAGES,
      disabled: isLast,
      icon: ChevronsRightIcon,
    },
  ];

  function renderStep(step: (typeof steps)[number]) {
    const Icon = step.icon;
    return (
      <PaginationItem key={step.label}>
        <PaginationLink
          href={`#page-${step.target}`}
          aria-label={step.label}
          aria-disabled={step.disabled || undefined}
          tabIndex={step.disabled ? -1 : undefined}
          className={
            step.disabled ? "pointer-events-none opacity-40" : undefined
          }
          onClick={(event) => {
            event.preventDefault();
            setPage(Math.min(TOTAL_PAGES, Math.max(1, step.target)));
          }}
        >
          <Icon aria-hidden="true" className="cn-rtl-flip" />
        </PaginationLink>
      </PaginationItem>
    );
  }

  return (
    <Pagination className="w-full max-w-xs">
      <PaginationContent className="w-full">
        {steps.map(renderStep)}
        <PaginationItem
          aria-live="polite"
          className="flex-1 px-2 text-center text-sm whitespace-nowrap text-muted-foreground"
        >
          Page{" "}
          <span className="font-medium text-foreground tabular-nums">
            {page}
          </span>{" "}
          of <span className="tabular-nums">{TOTAL_PAGES}</span>
        </PaginationItem>
        {forwardSteps.map(renderStep)}
      </PaginationContent>
    </Pagination>
  );
}
