"use client";

import * as React from "react";
import { SearchIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Input } from "@/registry/base/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/registry/base/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";

const members = [
  { name: "Maya Chen", email: "maya@northwind.io", role: "Owner" },
  { name: "Diego Alvarez", email: "diego@northwind.io", role: "Admin" },
  { name: "Priya Nair", email: "priya@northwind.io", role: "Admin" },
  { name: "Lena Fischer", email: "lena@northwind.io", role: "Member" },
  { name: "Tom Becker", email: "tom@northwind.io", role: "Member" },
  { name: "Aiko Tanaka", email: "aiko@northwind.io", role: "Member" },
  { name: "Sam Okafor", email: "sam@northwind.io", role: "Member" },
  { name: "Hannah Weiss", email: "hannah@northwind.io", role: "Billing" },
  { name: "Rafael Costa", email: "rafael@northwind.io", role: "Member" },
  { name: "Noor Haddad", email: "noor@northwind.io", role: "Member" },
  { name: "Elliot Park", email: "elliot@northwind.io", role: "Guest" },
  { name: "Ines Moreau", email: "ines@northwind.io", role: "Member" },
  { name: "Jonas Berg", email: "jonas@northwind.io", role: "Member" },
  { name: "Chloe Martin", email: "chloe@northwind.io", role: "Guest" },
  { name: "Kwame Mensah", email: "kwame@northwind.io", role: "Member" },
  { name: "Sofia Rossi", email: "sofia@northwind.io", role: "Admin" },
  { name: "Arjun Mehta", email: "arjun@northwind.io", role: "Member" },
  { name: "Olivia Grant", email: "olivia@northwind.io", role: "Member" },
  { name: "Mateo Silva", email: "mateo@northwind.io", role: "Guest" },
  { name: "Yuki Sato", email: "yuki@northwind.io", role: "Member" },
  { name: "Ben Carter", email: "ben@northwind.io", role: "Member" },
  { name: "Zara Ali", email: "zara@northwind.io", role: "Member" },
];

const pageSizes = [
  { value: "4", label: "4" },
  { value: "8", label: "8" },
  { value: "12", label: "12" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

// Always show the first and last page, plus one neighbor on each side.
function pageRange(current: number, total: number) {
  const pages: (number | "ellipsis")[] = [];
  for (let number = 1; number <= total; number++) {
    if (number === 1 || number === total || Math.abs(number - current) <= 1) {
      pages.push(number);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }
  return pages;
}

export default function Pagination10() {
  const [query, setQuery] = React.useState("");
  const [pageSize, setPageSize] = React.useState("4");
  const [page, setPage] = React.useState(1);

  const filtered = members.filter((member) =>
    `${member.name} ${member.email}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const size = Number(pageSize);
  const pageCount = Math.max(1, Math.ceil(filtered.length / size));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * size;
  const visible = filtered.slice(start, start + size);

  function goTo(event: React.MouseEvent, next: number) {
    event.preventDefault();
    if (next >= 1 && next <= pageCount) setPage(next);
  }

  return (
    <section
      aria-labelledby="members-title"
      className="w-full max-w-xl rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="members-title" className="font-medium">
            Members
          </h2>
          <p className="text-sm text-muted-foreground">
            {members.length} people in Northwind
          </p>
        </div>
        <div className="relative sm:w-56">
          <SearchIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            aria-label="Search members"
            placeholder="Search name or email"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            className="pl-8"
          />
        </div>
      </header>

      {visible.length > 0 ? (
        <ul className="divide-y">
          {visible.map((member) => (
            <li key={member.email} className="flex items-center gap-3 px-4 py-2.5">
              <Avatar>
                <AvatarFallback>{initials(member.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{member.name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {member.email}
                </p>
              </div>
              <Badge variant={member.role === "Owner" ? "default" : "outline"}>
                {member.role}
              </Badge>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-4 py-10 text-center">
          <p className="text-sm font-medium">No members match “{query}”</p>
          <p className="text-sm text-muted-foreground">
            Check the spelling or invite them to the workspace.
          </p>
        </div>
      )}

      <footer className="flex flex-col gap-3 border-t px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-4 md:justify-start">
          <div className="flex items-center gap-2">
            <span id="rows-per-page-label" className="text-sm text-muted-foreground">
              Rows
            </span>
            <Select
              items={pageSizes}
              value={pageSize}
              onValueChange={(value) => {
                if (value) {
                  setPageSize(value);
                  setPage(1);
                }
              }}
            >
              <SelectTrigger
                size="sm"
                aria-labelledby="rows-per-page-label"
                className="w-16"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizes.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
            {filtered.length === 0
              ? "0 results"
              : `${start + 1}–${start + visible.length} of ${filtered.length}`}
          </p>
        </div>
        <Pagination aria-label="Member list pages" className="mx-0 w-auto">
          <PaginationContent className="flex-wrap justify-center">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-disabled={current === 1}
                tabIndex={current === 1 ? -1 : undefined}
                className={current === 1 ? "pointer-events-none opacity-50" : ""}
                onClick={(event) => goTo(event, current - 1)}
              />
            </PaginationItem>
            {pageRange(current, pageCount).map((entry, index) =>
              entry === "ellipsis" ? (
                // biome-ignore lint/suspicious/noArrayIndexKey: ellipsis position is stable per render
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={entry}>
                  <PaginationLink
                    href="#"
                    isActive={entry === current}
                    aria-label={`Page ${entry}`}
                    onClick={(event) => goTo(event, entry)}
                  >
                    {entry}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                aria-disabled={current === pageCount}
                tabIndex={current === pageCount ? -1 : undefined}
                className={
                  current === pageCount ? "pointer-events-none opacity-50" : ""
                }
                onClick={(event) => goTo(event, current + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </footer>
    </section>
  );
}
