"use client";

import * as React from "react";
import {
  BellOffIcon,
  CreditCardIcon,
  LogInIcon,
  ShieldAlertIcon,
  UserPlusIcon,
  XIcon,
} from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/registry/base/ui/alert";
import { Button } from "@/registry/base/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

type Category = "security" | "billing" | "team";

type Notice = {
  id: string;
  category: Category;
  icon: typeof LogInIcon;
  urgent?: boolean;
  title: string;
  body: string;
  time: string;
  cta: string;
};

const initialNotices: Notice[] = [
  {
    id: "login",
    category: "security",
    icon: LogInIcon,
    urgent: true,
    title: "New sign-in from Lisbon, Portugal",
    body: "Chrome on Windows at 09:14. If this was not you, reset your password.",
    time: "12 min ago",
    cta: "Review activity",
  },
  {
    id: "2fa",
    category: "security",
    icon: ShieldAlertIcon,
    title: "2 admins have no two-factor authentication",
    body: "Require 2FA for admins to protect workspace settings.",
    time: "2 h ago",
    cta: "Enforce 2FA",
  },
  {
    id: "invoice",
    category: "billing",
    icon: CreditCardIcon,
    title: "Invoice INV-2041 is ready",
    body: "$1,240.00 for September, due Oct 15.",
    time: "Yesterday",
    cta: "Download PDF",
  },
  {
    id: "invite",
    category: "team",
    icon: UserPlusIcon,
    title: "Sofia Alvarez accepted your invite",
    body: "She joined Marketing with editor access.",
    time: "Mon",
    cta: "View profile",
  },
];

const tabs: { value: "all" | Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "security", label: "Security" },
  { value: "billing", label: "Billing" },
  { value: "team", label: "Team" },
];

export default function Alert18() {
  const [notices, setNotices] = React.useState(initialNotices);
  const [lastDismissed, setLastDismissed] = React.useState<{
    notice: Notice;
    index: number;
  } | null>(null);

  function dismiss(id: string) {
    const index = notices.findIndex((notice) => notice.id === id);
    if (index === -1) return;
    setLastDismissed({ notice: notices[index], index });
    setNotices((current) => current.filter((notice) => notice.id !== id));
  }

  function undo() {
    if (!lastDismissed) return;
    setNotices((current) => {
      const next = [...current];
      next.splice(lastDismissed.index, 0, lastDismissed.notice);
      return next;
    });
    setLastDismissed(null);
  }

  return (
    <section
      aria-labelledby="alert-18-heading"
      className="grid w-full max-w-md gap-3 rounded-xl border bg-card p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 id="alert-18-heading" className="font-medium">
          Notifications
        </h3>
        <Button
          variant="ghost"
          size="sm"
          disabled={notices.length === 0}
          onClick={() => {
            setNotices([]);
            setLastDismissed(null);
          }}
        >
          Clear all
        </Button>
      </div>
      <Tabs defaultValue="all" className="gap-3">
        <TabsList className="w-full">
          {tabs.map((tab) => {
            const count = notices.filter(
              (notice) => tab.value === "all" || notice.category === tab.value,
            ).length;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gap-1 px-1 text-xs sm:gap-1.5 sm:px-2 sm:text-sm"
              >
                {tab.label}
                {count > 0 ? (
                  <span className="text-muted-foreground tabular-nums">
                    {count}
                  </span>
                ) : null}
              </TabsTrigger>
            );
          })}
        </TabsList>
        {tabs.map((tab) => {
          const list = notices.filter(
            (notice) => tab.value === "all" || notice.category === tab.value,
          );
          return (
            <TabsContent key={tab.value} value={tab.value}>
              {list.length === 0 ? (
                <div className="grid justify-items-center gap-1 rounded-lg border border-dashed px-4 py-8 text-center">
                  <BellOffIcon
                    aria-hidden="true"
                    className="mb-1 size-5 text-muted-foreground"
                  />
                  <p className="font-medium">You are all caught up</p>
                  <p className="text-muted-foreground">
                    New {tab.value === "all" ? "" : `${tab.label.toLowerCase()} `}
                    notifications will show up here.
                  </p>
                </div>
              ) : (
                <ul className="grid gap-2">
                  {list.map((notice) => (
                    <li key={notice.id}>
                      <Alert
                        role="group"
                        aria-label={notice.title}
                        variant={notice.urgent ? "destructive" : "default"}
                        className="has-data-[slot=alert-action]:pr-10"
                      >
                        <notice.icon aria-hidden="true" />
                        <AlertTitle>{notice.title}</AlertTitle>
                        <AlertDescription>
                          <p>{notice.body}</p>
                        </AlertDescription>
                        <div className="col-start-2 mt-2 flex items-center justify-between gap-2">
                          <Button size="xs" variant="outline">
                            {notice.cta}
                          </Button>
                          <span className="shrink-0 text-xs whitespace-nowrap text-muted-foreground">
                            {notice.time}
                          </span>
                        </div>
                        <AlertAction>
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            aria-label={`Dismiss: ${notice.title}`}
                            onClick={() => dismiss(notice.id)}
                          >
                            <XIcon aria-hidden="true" />
                          </Button>
                        </AlertAction>
                      </Alert>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
      <div aria-live="polite" className="min-h-0">
        {lastDismissed ? (
          <div className="flex items-center justify-between gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm">
            <span className="truncate text-muted-foreground">
              Dismissed “{lastDismissed.notice.title}”
            </span>
            <Button size="xs" variant="ghost" onClick={undo}>
              Undo
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
