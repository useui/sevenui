"use client";

import { ChevronRightIcon, ClockIcon, SearchIcon } from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/base/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

type Status = "open" | "pending" | "solved";
type Priority = "urgent" | "high" | "normal";

type Ticket = {
  id: number;
  subject: string;
  customer: string;
  company: string;
  priority: Priority;
  status: Status;
  slaMinutes: number;
  assignee: string | null;
  lastMessage: string;
};

const ME = "Ava Collins";

const initialTickets: Ticket[] = [
  {
    id: 4821,
    subject: "Checkout fails with card_declined on every retry",
    customer: "Leo Martins",
    company: "Brightside Coffee",
    priority: "urgent",
    status: "open",
    slaMinutes: 18,
    assignee: null,
    lastMessage:
      "Our customers can't pay since this morning. We tried three different cards and all of them return card_declined, even though the bank says nothing was blocked.",
  },
  {
    id: 4817,
    subject: "Export to CSV drops rows after 10,000",
    customer: "Mei Tanaka",
    company: "Fieldnote",
    priority: "high",
    status: "open",
    slaMinutes: 95,
    assignee: "Ava Collins",
    lastMessage:
      "The export finishes but the file only has 10,000 rows. Our report for Q3 has about 14,200 orders.",
  },
  {
    id: 4809,
    subject: "How do I move my workspace to the EU region?",
    customer: "Jonas Weber",
    company: "Kleinwerk GmbH",
    priority: "normal",
    status: "open",
    slaMinutes: 310,
    assignee: null,
    lastMessage:
      "We need our data stored in the EU for compliance. Is there a way to migrate an existing workspace without losing history?",
  },
  {
    id: 4798,
    subject: "Invoice shows the wrong VAT number",
    customer: "Clara Duarte",
    company: "Norte Studio",
    priority: "normal",
    status: "pending",
    slaMinutes: 1440,
    assignee: "Ava Collins",
    lastMessage:
      "Thanks, I'll send the corrected VAT certificate from our accountant by Friday.",
  },
  {
    id: 4790,
    subject: "SSO login loops back to the sign-in page",
    customer: "Sam Patel",
    company: "Orbital Labs",
    priority: "high",
    status: "solved",
    slaMinutes: 0,
    assignee: "Ravi Shah",
    lastMessage: "Confirmed, the updated ACS URL fixed it. Thank you!",
  },
];

const statuses: { value: Status; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "pending", label: "Pending" },
  { value: "solved", label: "Solved" },
];

const priorityStyle: Record<Priority, string> = {
  urgent: "bg-destructive/10 text-destructive",
  high: "bg-warning/10 text-warning",
  normal: "bg-muted text-muted-foreground",
};

function formatSla(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  return `${Math.floor(minutes / 1440)}d`;
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("");

export default function Table19() {
  const [tickets, setTickets] = React.useState(initialTickets);
  const [tab, setTab] = React.useState<Status>("open");
  const [query, setQuery] = React.useState("");
  const [expanded, setExpanded] = React.useState<number | null>(4821);

  const update = (id: number, patch: Partial<Ticket>) =>
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );

  const q = query.trim().toLowerCase();
  const matches = (ticket: Ticket) =>
    !q ||
    ticket.subject.toLowerCase().includes(q) ||
    ticket.customer.toLowerCase().includes(q) ||
    ticket.company.toLowerCase().includes(q) ||
    String(ticket.id).includes(q);

  return (
    <div className="w-full max-w-3xl rounded-xl border bg-card text-card-foreground">
      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as Status)}
        className="gap-0"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <TabsList aria-label="Ticket status">
            {statuses.map((status) => {
              const count = tickets.filter(
                (t) => t.status === status.value,
              ).length;
              return (
                <TabsTrigger key={status.value} value={status.value}>
                  {status.label}
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {count}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          <InputGroup className="w-full sm:w-56">
            <InputGroupAddon>
              <SearchIcon aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              aria-label="Search tickets"
              placeholder="Search tickets"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </InputGroup>
        </div>
        {statuses.map((status) => {
          const rows = tickets.filter(
            (t) => t.status === status.value && matches(t),
          );
          return (
            <TabsContent key={status.value} value={status.value}>
              <Table aria-label={`${status.label} tickets`}>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-4">Ticket</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Priority
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      {status.value === "solved" ? "Solved by" : "Assignee"}
                    </TableHead>
                    <TableHead className="pr-4 text-right">
                      {status.value === "open" ? "SLA" : "Updated"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={4}
                        className="h-28 text-center whitespace-normal text-muted-foreground"
                      >
                        {q
                          ? `No ${status.label.toLowerCase()} tickets match “${query.trim()}”.`
                          : `No ${status.label.toLowerCase()} tickets. Nice work.`}
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((ticket) => {
                      const isOpen = expanded === ticket.id;
                      const breaching =
                        ticket.status === "open" && ticket.slaMinutes < 30;
                      const panelId = `table-19-ticket-${ticket.id}`;
                      return (
                        <React.Fragment key={ticket.id}>
                          <TableRow className={isOpen ? "border-0" : undefined}>
                            <TableCell className="py-3 pl-2 whitespace-normal sm:whitespace-nowrap">
                              <button
                                type="button"
                                aria-expanded={isOpen}
                                aria-controls={isOpen ? panelId : undefined}
                                onClick={() =>
                                  setExpanded(isOpen ? null : ticket.id)
                                }
                                className="group flex w-full items-start gap-2 rounded-md p-1 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:max-w-sm"
                              >
                                <ChevronRightIcon
                                  aria-hidden="true"
                                  className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-aria-expanded:rotate-90"
                                />
                                <span className="min-w-0">
                                  <span className="block font-medium sm:truncate">
                                    {ticket.subject}
                                  </span>
                                  <span className="block text-xs text-muted-foreground sm:truncate">
                                    #{ticket.id} · {ticket.customer},{" "}
                                    {ticket.company}
                                  </span>
                                </span>
                              </button>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge
                                className={`capitalize ${priorityStyle[ticket.priority]}`}
                              >
                                {ticket.priority}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {ticket.assignee ? (
                                <div className="flex items-center gap-2">
                                  <Avatar size="sm">
                                    <AvatarFallback>
                                      {initials(ticket.assignee)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">
                                    {ticket.assignee === ME
                                      ? "You"
                                      : ticket.assignee}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  Unassigned
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="pr-4 text-right">
                              {ticket.status === "open" ? (
                                <span
                                  className={
                                    breaching
                                      ? "inline-flex items-center gap-1 text-xs font-medium text-destructive tabular-nums"
                                      : "inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums"
                                  }
                                >
                                  <ClockIcon
                                    aria-hidden="true"
                                    className="size-3.5"
                                  />
                                  <span className="sr-only">
                                    First reply due in
                                  </span>
                                  {formatSla(ticket.slaMinutes)}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  {ticket.status === "pending"
                                    ? "Waiting on customer"
                                    : "Today"}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                          {isOpen ? (
                            <TableRow
                              id={panelId}
                              className="hover:bg-transparent"
                            >
                              <TableCell
                                colSpan={4}
                                className="px-4 pt-0 pb-4 whitespace-normal"
                              >
                                <div className="grid gap-3 rounded-lg bg-muted/50 p-3 sm:ml-7">
                                  <p className="text-sm leading-relaxed">
                                    <span className="font-medium">
                                      {ticket.customer}:{" "}
                                    </span>
                                    <span className="text-muted-foreground">
                                      {ticket.lastMessage}
                                    </span>
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {ticket.status !== "solved" &&
                                    ticket.assignee !== ME ? (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          update(ticket.id, { assignee: ME })
                                        }
                                      >
                                        Assign to me
                                      </Button>
                                    ) : null}
                                    {ticket.status === "solved" ? (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          update(ticket.id, {
                                            status: "open",
                                            slaMinutes: 240,
                                          })
                                        }
                                      >
                                        Reopen
                                      </Button>
                                    ) : (
                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          update(ticket.id, {
                                            status: "solved",
                                          });
                                          setExpanded(null);
                                        }}
                                      >
                                        Mark as solved
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : null}
                        </React.Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
