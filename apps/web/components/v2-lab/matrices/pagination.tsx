"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/registry/base/ui/pagination";
import { LabSection } from "../lab-frame";

function Pager({ active, size }: { active: number; size?: "sm" | "icon-sm" }) {
  return (
    <Pagination className="mx-0 w-auto justify-start">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#prev" />
        </PaginationItem>
        {[1, 2, 3].map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href={`#page-${page}`}
              isActive={page === active}
              size={size}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#next" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default function PaginationMatrix() {
  return (
    <div>
      <LabSection title="current = 1">
        <Pager active={1} />
      </LabSection>
      <LabSection title="current = 2">
        <Pager active={2} />
      </LabSection>
      <LabSection title="link size=icon-sm">
        <Pager active={3} size="icon-sm" />
      </LabSection>
    </div>
  );
}
