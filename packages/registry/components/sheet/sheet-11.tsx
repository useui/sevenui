"use client";

import * as React from "react";
import { cn } from "cn";
import {
  ArrowLeftRight,
  ChartPie,
  CreditCard,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Settings,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Separator } from "@/registry/base/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/base/ui/sheet";

const sections = [
  {
    label: "Money",
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      {
        id: "transactions",
        label: "Transactions",
        icon: ArrowLeftRight,
        count: 12,
      },
      { id: "cards", label: "Cards", icon: CreditCard },
      { id: "invoices", label: "Invoices", icon: FileText, count: 3 },
    ],
  },
  {
    label: "Company",
    items: [
      { id: "reports", label: "Reports", icon: ChartPie },
      { id: "team", label: "Team", icon: Users },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

const activity = [
  {
    id: "t1",
    merchant: "Figma",
    date: "Today · Card •• 4821",
    amount: "−$45.00",
  },
  {
    id: "t2",
    merchant: "Client payment · Oakline",
    date: "Yesterday · Transfer",
    amount: "+$3,200.00",
  },
  {
    id: "t3",
    merchant: "Google Workspace",
    date: "Sep 22 · Card •• 4821",
    amount: "−$72.00",
  },
];

const helpItem = { id: "help", label: "Help & support", icon: LifeBuoy };

const allItems = [...sections.flatMap((section) => section.items), helpItem];

export default function Sheet11() {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState("transactions");

  const current = allItems.find((item) => item.id === active) ?? allItems[0];

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-2xl border bg-background">
      <header className="flex items-center gap-2 border-b px-3 py-2.5">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open navigation"
              />
            }
          >
            <Menu aria-hidden="true" />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="gap-0 data-[side=left]:w-[min(18rem,85vw)]"
          >
            <SheetHeader className="flex-row items-center gap-3 pr-12">
              <div
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
              >
                L
              </div>
              <div className="grid min-w-0 gap-0.5">
                <SheetTitle className="truncate">Ledgerly</SheetTitle>
                <SheetDescription className="truncate text-xs">
                  Harbor &amp; Pine Studio
                </SheetDescription>
              </div>
            </SheetHeader>
            <nav
              aria-label="Main"
              className="flex flex-1 flex-col gap-5 overflow-y-auto px-2 py-2"
            >
              {sections.map((section) => (
                <div key={section.label} className="grid gap-1">
                  <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">
                    {section.label}
                  </p>
                  <ul className="grid gap-0.5">
                    {section.items.map((item) => {
                      const isActive = item.id === active;
                      const Icon = item.icon;
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            aria-current={isActive ? "page" : undefined}
                            onClick={() => {
                              setActive(item.id);
                              setOpen(false);
                            }}
                            className={cn(
                              "flex h-10 w-full items-center gap-3 rounded-lg px-2 text-sm transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
                              isActive
                                ? "bg-accent font-medium text-accent-foreground"
                                : "text-muted-foreground hover:text-foreground",
                            )}
                          >
                            <Icon aria-hidden="true" className="size-4" />
                            <span className="flex-1 text-left">
                              {item.label}
                            </span>
                            {"count" in item && item.count ? (
                              <Badge
                                variant={isActive ? "default" : "secondary"}
                                className="tabular-nums"
                              >
                                {item.count}
                                <span className="sr-only"> new</span>
                              </Badge>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              <Separator className="mx-2 data-[orientation=horizontal]:w-auto" />
              <Button
                variant="ghost"
                aria-current={active === helpItem.id ? "page" : undefined}
                onClick={() => {
                  setActive(helpItem.id);
                  setOpen(false);
                }}
                className={cn(
                  "h-10 justify-start gap-3 px-2 font-normal text-muted-foreground",
                  active === helpItem.id &&
                    "bg-accent font-medium text-accent-foreground",
                )}
              >
                <LifeBuoy aria-hidden="true" />
                Help &amp; support
              </Button>
            </nav>
            <SheetFooter className="flex-row items-center gap-3 border-t">
              <Avatar>
                <AvatarFallback>EW</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">Elena Walsh</p>
                <p className="truncate text-xs text-muted-foreground">
                  elena@harborpine.co
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Sign out"
                onClick={() => setOpen(false)}
              >
                <LogOut aria-hidden="true" />
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        <p className="flex-1 truncate text-sm font-medium">{current.label}</p>
        <Avatar size="sm">
          <AvatarFallback>EW</AvatarFallback>
        </Avatar>
      </header>
      <ul className="divide-y text-sm" aria-label="Recent activity">
        {activity.map((entry) => (
          <li
            key={entry.id}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{entry.merchant}</p>
              <p className="text-xs text-muted-foreground">{entry.date}</p>
            </div>
            <p className="shrink-0 tabular-nums">{entry.amount}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
