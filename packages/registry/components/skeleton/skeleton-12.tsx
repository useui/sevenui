"use client";

import { Search } from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Input } from "@/registry/base/ui/input";
import { Skeleton } from "@/registry/base/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";

const members = [
  {
    name: "Amara Okafor",
    email: "amara@lumen.dev",
    role: "Owner",
    initials: "AO",
  },
  {
    name: "Jonas Weber",
    email: "jonas@lumen.dev",
    role: "Admin",
    initials: "JW",
  },
  {
    name: "Sofia Marín",
    email: "sofia@lumen.dev",
    role: "Member",
    initials: "SM",
  },
  {
    name: "Kenji Watanabe",
    email: "kenji@lumen.dev",
    role: "Member",
    initials: "KW",
  },
  {
    name: "Hannah Brooks",
    email: "hannah@contractor.io",
    role: "Guest",
    initials: "HB",
  },
];

const skeletonRows = ["s1", "s2", "s3"];

export default function Skeleton12() {
  const id = React.useId();
  const [query, setQuery] = React.useState("");
  const [applied, setApplied] = React.useState("");

  // The server search runs once typing settles; rows stay skeletons until then.
  React.useEffect(() => {
    const timer = window.setTimeout(() => setApplied(query), 700);
    return () => window.clearTimeout(timer);
  }, [query]);

  const searching = query !== applied;
  const needle = applied.trim().toLowerCase();
  const results = members.filter(
    (member) =>
      member.name.toLowerCase().includes(needle) ||
      member.email.toLowerCase().includes(needle),
  );

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="flex w-full max-w-xl flex-col gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 id={`${id}-title`} className="text-base font-semibold">
            Team members
          </h3>
          <p className="text-sm text-muted-foreground">
            5 seats used of 8 on the Growth plan.
          </p>
        </div>
        <div className="relative w-full sm:w-56">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            aria-label="Search members by name or email"
            placeholder="Search members"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <p role="status" className="sr-only">
        {searching
          ? "Searching members"
          : `${results.length} ${results.length === 1 ? "member" : "members"} found`}
      </p>

      <Table aria-busy={searching} className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead className="w-20 text-right sm:w-24">Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {searching ? (
            skeletonRows.map((row) => (
              <TableRow key={row} aria-hidden="true">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 shrink-0 rounded-full" />
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <Skeleton className="h-3.5 w-28 max-w-full" />
                      <Skeleton className="h-3 w-36 max-w-full" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="ml-auto h-5 w-14 rounded-full" />
                </TableCell>
              </TableRow>
            ))
          ) : results.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={2}
                className="h-24 text-center whitespace-normal text-muted-foreground"
              >
                No one matches “{applied}”. Invite them from Settings → Seats.
              </TableCell>
            </TableRow>
          ) : (
            results.map((member) => (
              <TableRow key={member.email}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8 shrink-0">
                      <AvatarImage src="/placeholder.svg" alt="" />
                      <AvatarFallback>{member.initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{member.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={member.role === "Owner" ? "default" : "secondary"}
                  >
                    {member.role}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </section>
  );
}
