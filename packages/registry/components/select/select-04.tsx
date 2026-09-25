"use client";

import { Label } from "@/registry/base/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";

const categories = [
  { value: "billing", label: "Billing" },
  { value: "technical", label: "Technical issue" },
  { value: "account", label: "Account access" },
  { value: "feedback", label: "Product feedback" },
];

const periods = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last quarter" },
];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "priority", label: "Priority" },
];

export default function Select04() {
  return (
    <div className="grid w-full max-w-sm gap-6">
      <div className="grid gap-1.5">
        <Label htmlFor="select-04-outline">Category</Label>
        <Select items={categories} defaultValue="technical">
          <SelectTrigger id="select-04-outline" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Outline: the default for form fields.
        </p>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="select-04-filled">Reporting period</Label>
        <Select items={periods} defaultValue="30d">
          <SelectTrigger
            id="select-04-filled"
            className="w-full border-transparent bg-muted hover:bg-muted/70 dark:bg-muted dark:hover:bg-muted/70"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periods.map((period) => (
              <SelectItem key={period.value} value={period.value}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Filled: sits quietly in dense filter bars.
        </p>
      </div>

      <div className="grid gap-1.5">
        <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
          <span className="text-sm font-medium">Open tickets</span>
          <div className="flex items-center gap-1">
            <Label
              htmlFor="select-04-ghost"
              className="font-normal text-muted-foreground"
            >
              Sort by
            </Label>
            <Select items={sortOptions} defaultValue="newest">
              <SelectTrigger
                id="select-04-ghost"
                size="sm"
                className="border-transparent bg-transparent px-2 font-medium hover:bg-accent dark:bg-transparent dark:hover:bg-accent"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end" className="min-w-32">
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Ghost: an inline control inside a header.
        </p>
      </div>
    </div>
  );
}
