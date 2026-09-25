"use client";

import { CheckIcon, MinusIcon } from "lucide-react";
import * as React from "react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";

const plans = [
  { key: "hobby", name: "Hobby", monthly: 0, yearly: 0, cta: "Start free" },
  {
    key: "pro",
    name: "Pro",
    monthly: 24,
    yearly: 19,
    cta: "Start trial",
    featured: true,
  },
  {
    key: "scale",
    name: "Scale",
    monthly: 89,
    yearly: 74,
    cta: "Talk to sales",
  },
] as const;

type PlanKey = (typeof plans)[number]["key"];
type Value = boolean | string;

const sections: {
  title: string;
  rows: { feature: string; values: Record<PlanKey, Value> }[];
}[] = [
  {
    title: "Usage",
    rows: [
      {
        feature: "Projects",
        values: { hobby: "3", pro: "Unlimited", scale: "Unlimited" },
      },
      {
        feature: "Monthly form responses",
        values: { hobby: "100", pro: "10,000", scale: "250,000" },
      },
      {
        feature: "File uploads",
        values: { hobby: "100 MB", pro: "10 GB", scale: "1 TB" },
      },
    ],
  },
  {
    title: "Features",
    rows: [
      {
        feature: "Custom domains",
        values: { hobby: false, pro: true, scale: true },
      },
      {
        feature: "Conditional logic",
        values: { hobby: true, pro: true, scale: true },
      },
      {
        feature: "Remove branding",
        values: { hobby: false, pro: true, scale: true },
      },
      {
        feature: "Webhooks & API",
        values: { hobby: false, pro: true, scale: true },
      },
    ],
  },
  {
    title: "Security",
    rows: [
      {
        feature: "SAML single sign-on",
        values: { hobby: false, pro: false, scale: true },
      },
      {
        feature: "Audit log retention",
        values: { hobby: false, pro: "30 days", scale: "1 year" },
      },
    ],
  },
];

function PlanValue({ value }: { value: Value }) {
  if (value === true) {
    return (
      <>
        <CheckIcon aria-hidden="true" className="mx-auto size-4 text-primary" />
        <span className="sr-only">Included</span>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <MinusIcon
          aria-hidden="true"
          className="mx-auto size-4 text-muted-foreground/60"
        />
        <span className="sr-only">Not included</span>
      </>
    );
  }
  return <span className="text-sm">{value}</span>;
}

export default function Table18() {
  const [yearly, setYearly] = React.useState(true);
  const [chosen, setChosen] = React.useState<PlanKey | null>(null);

  return (
    <div className="grid w-full max-w-3xl gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id="table-18-title" className="text-lg font-semibold">
          Compare plans
        </h3>
        <div className="flex items-center gap-2">
          <Switch
            id="table-18-billing"
            checked={yearly}
            onCheckedChange={setYearly}
          />
          <Label htmlFor="table-18-billing">Bill yearly</Label>
          <Badge variant="secondary">Save up to 20%</Badge>
        </div>
      </div>
      <Table aria-labelledby="table-18-title" className="min-w-120 table-fixed">
        <colgroup>
          <col className="w-[34%]" />
          {plans.map((plan) => (
            <col
              key={plan.key}
              className={"featured" in plan ? "bg-muted/50" : undefined}
            />
          ))}
        </colgroup>
        <TableHeader className="[&_tr]:border-0">
          <TableRow className="hover:bg-transparent">
            <TableHead className="align-bottom">
              <span className="sr-only">Feature</span>
            </TableHead>
            {plans.map((plan) => {
              const price = yearly ? plan.yearly : plan.monthly;
              const isChosen = chosen === plan.key;
              return (
                <TableHead
                  key={plan.key}
                  scope="col"
                  className="h-auto px-1 pt-4 pb-3 text-center align-top whitespace-normal sm:px-3"
                >
                  <div className="grid justify-items-center gap-1">
                    <span className="text-sm font-semibold">{plan.name}</span>
                    <span className="text-xl font-semibold tabular-nums sm:text-2xl">
                      ${price}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {price === 0
                        ? "forever"
                        : yearly
                          ? "per month, billed yearly"
                          : "per month"}
                    </span>
                    <Button
                      size="sm"
                      variant={"featured" in plan ? "default" : "outline"}
                      className="mt-2 w-full"
                      aria-label={
                        isChosen
                          ? `${plan.name} selected`
                          : `${plan.cta} on ${plan.name}`
                      }
                      aria-pressed={isChosen}
                      onClick={() => setChosen(isChosen ? null : plan.key)}
                    >
                      {isChosen ? (
                        <CheckIcon aria-hidden="true" data-icon="inline-start" />
                      ) : null}
                      {isChosen ? "Selected" : plan.cta}
                    </Button>
                  </div>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        {sections.map((section) => (
          <TableBody key={section.title}>
            <TableRow className="border-b hover:bg-transparent">
              <TableHead
                scope="colgroup"
                colSpan={plans.length + 1}
                className="h-auto pt-6 pb-2 text-xs font-semibold text-muted-foreground"
              >
                {section.title}
              </TableHead>
            </TableRow>
            {section.rows.map((row) => (
              <TableRow key={row.feature} className="hover:bg-transparent">
                <TableHead
                  scope="row"
                  className="h-auto py-3 font-normal whitespace-normal text-muted-foreground"
                >
                  {row.feature}
                </TableHead>
                {plans.map((plan) => (
                  <TableCell
                    key={plan.key}
                    className="px-1 py-3 text-center whitespace-normal sm:px-3"
                  >
                    <PlanValue value={row.values[plan.key]} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        ))}
      </Table>
    </div>
  );
}
