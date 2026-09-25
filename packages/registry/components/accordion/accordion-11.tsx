"use client";

import { CreditCard, MessagesSquare, ShieldAlert } from "lucide-react";
import * as React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/base/ui/accordion";
import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";

const groups = [
  {
    value: "activity",
    icon: MessagesSquare,
    title: "Workspace activity",
    settings: [
      {
        id: "mentions",
        label: "Mentions and replies",
        hint: "When someone @mentions you or replies to your thread.",
      },
      {
        id: "assigned",
        label: "Assigned to you",
        hint: "When an issue or review is assigned to you.",
      },
      {
        id: "digest",
        label: "Daily digest",
        hint: "A 9:00 AM summary of everything you missed.",
      },
    ],
  },
  {
    value: "billing",
    icon: CreditCard,
    title: "Billing",
    settings: [
      {
        id: "receipts",
        label: "Payment receipts",
        hint: "A PDF receipt after every successful charge.",
      },
      {
        id: "failed",
        label: "Failed payments",
        hint: "When a charge is declined and needs attention.",
      },
    ],
  },
  {
    value: "security",
    icon: ShieldAlert,
    title: "Security",
    settings: [
      {
        id: "sign-in",
        label: "New sign-in",
        hint: "When your account is used on a new device or browser.",
      },
      {
        id: "api-keys",
        label: "API key changes",
        hint: "When a key is created, rotated, or revoked.",
      },
    ],
  },
];

const initialEnabled: Record<string, boolean> = {
  mentions: true,
  assigned: true,
  digest: false,
  receipts: true,
  failed: true,
  "sign-in": true,
  "api-keys": false,
};

export default function Accordion11() {
  const [enabled, setEnabled] = React.useState(initialEnabled);

  function toggle(id: string, checked: boolean) {
    setEnabled((current) => ({ ...current, [id]: checked }));
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold">Email notifications</h3>
        <p className="text-sm text-muted-foreground">
          Choose what lands in your inbox at mara@northwind.dev.
        </p>
      </div>
      <Accordion
        multiple
        defaultValue={["activity"]}
        className="rounded-xl border"
      >
        {groups.map((group) => {
          const onCount = group.settings.filter((s) => enabled[s.id]).length;
          return (
            <AccordionItem key={group.value} value={group.value}>
              <AccordionTrigger className="items-center gap-3 px-4 py-3 hover:no-underline">
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted"
                >
                  <group.icon className="size-4 text-muted-foreground" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span>{group.title}</span>
                  <span className="text-xs font-normal text-muted-foreground tabular-nums">
                    {onCount === 0
                      ? "All off"
                      : `${onCount} of ${group.settings.length} on`}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ul className="flex flex-col divide-y rounded-lg bg-muted/40 px-3">
                  {group.settings.map((setting) => (
                    <li
                      key={setting.id}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div className="flex min-w-0 flex-col gap-1">
                        <Label htmlFor={`accordion-11-${setting.id}`}>
                          {setting.label}
                        </Label>
                        <p
                          id={`accordion-11-${setting.id}-hint`}
                          className="text-xs text-muted-foreground"
                        >
                          {setting.hint}
                        </p>
                      </div>
                      <Switch
                        id={`accordion-11-${setting.id}`}
                        aria-describedby={`accordion-11-${setting.id}-hint`}
                        checked={enabled[setting.id]}
                        onCheckedChange={(checked) =>
                          toggle(setting.id, checked)
                        }
                      />
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
