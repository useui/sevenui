"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/registry/base/ui/navigation-menu";

type Section = {
  id: string;
  label: string;
  hint: string;
  rows: [string, string][];
};

const groups: { label: string; sections: Section[] }[] = [
  {
    label: "Workspace",
    sections: [
      {
        id: "general",
        label: "General",
        hint: "Name, URL, and default timezone",
        rows: [
          ["Workspace name", "Harbor Studio"],
          ["URL", "harbor.plane.so"],
          ["Timezone", "Europe/Lisbon (UTC+1)"],
        ],
      },
      {
        id: "members",
        label: "Members",
        hint: "Seats, roles, and pending invites",
        rows: [
          ["Seats used", "14 of 20"],
          ["Admins", "3"],
          ["Pending invites", "2"],
        ],
      },
      {
        id: "integrations",
        label: "Integrations",
        hint: "GitHub, Slack, and Figma connections",
        rows: [
          ["GitHub", "Connected to harbor-studio"],
          ["Slack", "Posting to #releases"],
          ["Figma", "Not connected"],
        ],
      },
    ],
  },
  {
    label: "Billing",
    sections: [
      {
        id: "plan",
        label: "Plan",
        hint: "Team plan, billed annually",
        rows: [
          ["Current plan", "Team · $16 per seat"],
          ["Renews", "March 3, 2027"],
          ["Next charge", "$3,840.00"],
        ],
      },
      {
        id: "invoices",
        label: "Invoices",
        hint: "Download receipts for your records",
        rows: [
          ["Latest", "INV-2026-0312 · Paid"],
          ["Billing email", "finance@harbor.studio"],
          ["Tax ID", "PT 514 283 091"],
        ],
      },
      {
        id: "payment",
        label: "Payment method",
        hint: "Card used for renewals",
        rows: [
          ["Card", "Visa ending 4242"],
          ["Expires", "08/28"],
          ["Backup method", "None"],
        ],
      },
    ],
  },
];

export default function NavigationMenu11() {
  const [currentId, setCurrentId] = React.useState("members");
  const group =
    groups.find((g) => g.sections.some((s) => s.id === currentId)) ?? groups[0];
  const section =
    group.sections.find((s) => s.id === currentId) ?? group.sections[0];

  return (
    <section
      aria-labelledby="navigation-menu-11-title"
      className="w-full max-w-lg rounded-xl border bg-card text-card-foreground"
    >
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <h2 id="navigation-menu-11-title" className="pl-1 text-sm font-semibold">Settings</h2>
        <NavigationMenu aria-label="Settings sections" align="end">
          <NavigationMenuList className="gap-0.5">
            {groups.map((g) => (
              <NavigationMenuItem key={g.label}>
                <NavigationMenuTrigger
                  className={
                    g === group ? "bg-muted text-foreground" : undefined
                  }
                >
                  {g.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-64 gap-0.5 p-1">
                    {g.sections.map((s) => (
                      <li key={s.id}>
                        <NavigationMenuLink
                          href={`#settings-${s.id}`}
                          active={s.id === currentId}
                          aria-current={s.id === currentId ? "page" : undefined}
                          closeOnClick
                          onClick={(event) => {
                            event.preventDefault();
                            setCurrentId(s.id);
                          }}
                          className="flex-col items-start gap-0.5"
                        >
                          <span className="font-medium">{s.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {s.hint}
                          </span>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div className="flex flex-col gap-3 p-4">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1 text-xs text-muted-foreground">
            <li>{group.label}</li>
            <li aria-hidden="true">
              <ChevronRight className="size-3" />
            </li>
            <li aria-current="page" className="font-medium text-foreground">
              {section.label}
            </li>
          </ol>
        </nav>
        <div>
          <h3 className="text-base font-semibold">
            {section.label}
          </h3>
          <p className="text-sm text-muted-foreground">{section.hint}</p>
        </div>
        <dl className="divide-y rounded-lg border">
          {section.rows.map(([term, value]) => (
            <div
              key={term}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-0.5 px-3 py-2 text-sm"
            >
              <dt className="text-muted-foreground">{term}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
