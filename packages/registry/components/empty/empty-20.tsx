"use client";

import * as React from "react";
import {
  ChartPieIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HouseIcon,
  PencilLineIcon,
  ReceiptTextIcon,
  ScanLineIcon,
  SettingsIcon,
  Trash2Icon,
  WalletIcon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";
import { Progress, ProgressLabel, ProgressValue } from "@/registry/base/ui/progress";

type Expense = { id: string; merchant: string; category: string; amount: number };

const budget = 1200;

const months = [
  {
    key: "2026-08",
    label: "August 2026",
    short: "August",
    expenses: [
      { id: "e-1", merchant: "Trader Joe's", category: "Groceries", amount: 84.2 },
      { id: "e-2", merchant: "City Transit pass", category: "Transport", amount: 96 },
      { id: "e-3", merchant: "Ember Coffee", category: "Eating out", amount: 12.5 },
      { id: "e-4", merchant: "Northwind Electric", category: "Utilities", amount: 71.35 },
    ] as Expense[],
  },
  { key: "2026-09", label: "September 2026", short: "September", expenses: [] as Expense[] },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const tabs = [
  { label: "Home", icon: HouseIcon },
  { label: "Budgets", icon: WalletIcon },
  { label: "Insights", icon: ChartPieIcon },
  { label: "Settings", icon: SettingsIcon },
];

export default function Empty20() {
  const [monthIndex, setMonthIndex] = React.useState(1);
  const [added, setAdded] = React.useState<Expense[]>([]);

  const month = months[monthIndex];
  const expenses = monthIndex === 1 ? added : month.expenses;
  const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  function addSample() {
    setAdded((current) => [
      ...current,
      {
        id: `new-${current.length + 1}`,
        merchant: "Farmers market",
        category: "Groceries",
        amount: 23.4,
      },
    ]);
  }

  return (
    <div className="flex h-[36rem] w-full max-w-[22rem] flex-col overflow-hidden rounded-[2rem] border-[6px] border-muted bg-background text-foreground shadow-lg">
      <header className="flex flex-col gap-4 px-5 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Previous month"
            disabled={monthIndex === 0}
            onClick={() => setMonthIndex((index) => index - 1)}
          >
            <ChevronLeftIcon aria-hidden="true" />
          </Button>
          <h2 className="text-sm font-medium" aria-live="polite">
            {month.label}
          </h2>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Next month"
            disabled={monthIndex === months.length - 1}
            onClick={() => setMonthIndex((index) => index + 1)}
          >
            <ChevronRightIcon aria-hidden="true" />
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-3xl font-semibold tracking-tight tabular-nums">
            {currency.format(spent)}
            <span className="ml-1.5 text-sm font-normal tracking-normal text-muted-foreground">
              spent
            </span>
          </p>
          <Progress value={Math.min(100, (spent / budget) * 100)} className="gap-1.5">
            <ProgressLabel className="text-xs font-normal text-muted-foreground">
              Monthly budget {currency.format(budget)}
            </ProgressLabel>
            <ProgressValue className="text-xs" />
          </Progress>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto border-t bg-muted/30 px-4 py-4">
        {expenses.length === 0 ? (
          <Empty className="flex-1 p-2">
            <EmptyHeader>
              <EmptyMedia className="size-14 rounded-2xl bg-card text-muted-foreground shadow-sm ring-1 ring-border">
                <ReceiptTextIcon className="size-6" aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle className="text-base">
                Nothing logged in {month.short}
              </EmptyTitle>
              <EmptyDescription>
                Snap a receipt and we&apos;ll fill in the merchant, amount, and
                category for you.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="gap-2">
              <Button size="lg" className="w-full">
                <ScanLineIcon data-icon="inline-start" aria-hidden="true" />
                Scan a receipt
              </Button>
              <Button size="lg" variant="outline" className="w-full" onClick={addSample}>
                <PencilLineIcon data-icon="inline-start" aria-hidden="true" />
                Add manually
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <ul aria-label={`${month.short} expenses`} className="flex flex-col gap-2">
            {expenses.map((expense) => (
              <li
                key={expense.id}
                className="flex items-center gap-3 rounded-xl bg-card px-3 py-2.5 shadow-sm ring-1 ring-border"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{expense.merchant}</p>
                  <p className="text-xs text-muted-foreground">{expense.category}</p>
                </div>
                <span className="text-sm tabular-nums">
                  &minus;{currency.format(expense.amount)}
                </span>
                {monthIndex === 1 && (
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Remove ${expense.merchant}`}
                    onClick={() =>
                      setAdded((current) =>
                        current.filter((item) => item.id !== expense.id),
                      )
                    }
                  >
                    <Trash2Icon aria-hidden="true" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <nav aria-label="Primary" className="grid grid-cols-4 border-t bg-background px-2 pt-1.5 pb-3">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            type="button"
            aria-current={index === 0 ? "page" : undefined}
            className="flex flex-col items-center gap-1 rounded-lg py-1.5 text-[0.7rem] text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:text-foreground"
          >
            <tab.icon className="size-5" aria-hidden="true" />
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
