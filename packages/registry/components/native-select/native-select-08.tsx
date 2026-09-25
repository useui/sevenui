"use client";

import { CheckIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { ButtonGroup } from "@/registry/base/ui/button-group";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";

const dialCodes = [
  { value: "+1", label: "US +1" },
  { value: "+44", label: "UK +44" },
  { value: "+49", label: "DE +49" },
  { value: "+90", label: "TR +90" },
];

const currencies = ["USD", "EUR", "GBP", "JPY"];

const bulkActions = [
  { value: "archive", label: "Archive" },
  { value: "assign", label: "Assign to me" },
  { value: "export", label: "Export as CSV" },
];

const appliedLabels: Record<string, string> = {
  archive: "3 tickets archived",
  assign: "3 tickets assigned to you",
  export: "Export started for 3 tickets",
};

export default function NativeSelect08() {
  const [action, setAction] = React.useState("archive");
  const [applied, setApplied] = React.useState<string | null>(null);

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="native-select-08-phone">Phone number</Label>
        <ButtonGroup className="w-full">
          <NativeSelect
            defaultValue="+49"
            aria-label="Country dialing code"
            className="shrink-0 [&>select]:rounded-r-none"
          >
            {dialCodes.map((code) => (
              <NativeSelectOption key={code.value} value={code.value}>
                {code.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <Input
            id="native-select-08-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="151 2345 6789"
          />
        </ButtonGroup>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="native-select-08-amount">Invoice amount</Label>
        <ButtonGroup className="w-full">
          <Input
            id="native-select-08-amount"
            inputMode="decimal"
            defaultValue="1,250.00"
            className="tabular-nums"
          />
          <NativeSelect
            defaultValue="EUR"
            aria-label="Currency"
            className="shrink-0 [&>select]:rounded-l-none [&>select]:border-l-0"
          >
            {currencies.map((currency) => (
              <NativeSelectOption key={currency} value={currency}>
                {currency}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </ButtonGroup>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-2 pl-3">
        <span
          aria-live="polite"
          className="flex items-center gap-1.5 text-sm font-medium tabular-nums"
        >
          {applied ? (
            <>
              <CheckIcon aria-hidden="true" className="size-3.5 text-success" />
              {applied}
            </>
          ) : (
            "3 tickets selected"
          )}
        </span>
        <ButtonGroup>
          <NativeSelect
            size="sm"
            value={action}
            onChange={(event) => {
              setAction(event.target.value);
              setApplied(null);
            }}
            aria-label="Bulk action"
            className="[&>select]:rounded-r-none [&>select]:bg-background"
          >
            {bulkActions.map((action) => (
              <NativeSelectOption key={action.value} value={action.value}>
                {action.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => setApplied(appliedLabels[action] ?? null)}
          >
            Apply
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
