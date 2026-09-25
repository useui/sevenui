"use client";

import * as React from "react";

import { Label } from "@/registry/base/ui/label";
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";

type Category = {
  value: string;
  label: string;
  account: string;
  approval: string;
  disabled?: boolean;
};

const categoryGroups: { label: string; categories: Category[] }[] = [
  {
    label: "Travel",
    categories: [
      {
        value: "airfare",
        label: "Airfare",
        account: "6110",
        approval: "Manager approval",
      },
      {
        value: "lodging",
        label: "Lodging",
        account: "6120",
        approval: "Manager approval",
      },
      {
        value: "ground",
        label: "Ground transport",
        account: "6130",
        approval: "Auto-approved under $150",
      },
    ],
  },
  {
    label: "Meals",
    categories: [
      {
        value: "client-meals",
        label: "Client meals",
        account: "6210",
        approval: "Attendee list required",
      },
      {
        value: "team-meals",
        label: "Team meals",
        account: "6220",
        approval: "Auto-approved under $40 per person",
      },
    ],
  },
  {
    label: "Software and equipment",
    categories: [
      {
        value: "saas",
        label: "Software subscriptions",
        account: "6310",
        approval: "IT approval",
      },
      {
        value: "hardware",
        label: "Hardware under $2,500",
        account: "6320",
        approval: "Manager approval",
      },
      {
        value: "capital",
        label: "Hardware over $2,500",
        account: "1510",
        approval: "Filed as an asset request",
        disabled: true,
      },
    ],
  },
];

const categories = categoryGroups.flatMap((group) => group.categories);

export default function NativeSelect02() {
  const [value, setValue] = React.useState("");
  const selected = categories.find((item) => item.value === value);

  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
        <div className="grid min-w-0 gap-0.5">
          <span className="truncate text-sm font-medium">Figma Professional</span>
          <span className="text-xs text-muted-foreground">Card ending 4412 · Sep 18</span>
        </div>
        <span className="shrink-0 text-sm font-medium tabular-nums">$540.00</span>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="native-select-02-category">Expense category</Label>
        <NativeSelect
          id="native-select-02-category"
          className="w-full"
          required
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-describedby="native-select-02-summary"
        >
          <NativeSelectOption value="" disabled>
            Choose a category
          </NativeSelectOption>
          {categoryGroups.map((group) => (
            <NativeSelectOptGroup key={group.label} label={group.label}>
              {group.categories.map((item) => (
                <NativeSelectOption
                  key={item.value}
                  value={item.value}
                  disabled={item.disabled}
                >
                  {item.disabled
                    ? `${item.label} (asset request)`
                    : item.label}
                </NativeSelectOption>
              ))}
            </NativeSelectOptGroup>
          ))}
        </NativeSelect>
        <p
          id="native-select-02-summary"
          className="text-sm text-muted-foreground"
          aria-live="polite"
        >
          {selected ? (
            <>
              Posts to account{" "}
              <span className="font-medium text-foreground tabular-nums">
                {selected.account}
              </span>{" "}
              · {selected.approval}
            </>
          ) : (
            "Hardware over $2,500 goes through an asset request instead."
          )}
        </p>
      </div>
    </div>
  );
}
