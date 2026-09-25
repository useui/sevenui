"use client";

import { Check, Pencil } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";

type Rate = { zone: string; region: string; base: string; perKg: string };

const initialRates: Rate[] = [
  { zone: "Zone 1", region: "Domestic", base: "4.90", perKg: "0.60" },
  { zone: "Zone 2", region: "Canada & Mexico", base: "12.50", perKg: "1.80" },
  { zone: "Zone 3", region: "Europe", base: "18.00", perKg: "2.40" },
  { zone: "Zone 4", region: "Asia Pacific", base: "22.00", perKg: "3.10" },
];

const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;

export default function Table10() {
  const [rates, setRates] = React.useState(initialRates);
  const [draft, setDraft] = React.useState(initialRates);
  const [editing, setEditing] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const invalid = draft.some(
    (rate) => !PRICE_PATTERN.test(rate.base) || !PRICE_PATTERN.test(rate.perKg),
  );

  function updateDraft(index: number, field: "base" | "perKg", value: string) {
    setDraft((current) =>
      current.map((rate, i) =>
        i === index ? { ...rate, [field]: value } : rate,
      ),
    );
  }

  function startEditing() {
    setDraft(rates);
    setSaved(false);
    setEditing(true);
  }

  function save() {
    if (invalid) return;
    setRates(draft);
    setEditing(false);
    setSaved(true);
  }

  const rows = editing ? draft : rates;

  return (
    <div className="w-full max-w-xl space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">Shipping rates</p>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {editing ? (
              "Editing. Prices in USD."
            ) : saved ? (
              <span className="inline-flex items-center gap-1 text-foreground">
                <Check aria-hidden="true" className="size-3.5 text-success" />
                Rates saved
              </span>
            ) : (
              "Read-only. Prices in USD."
            )}
          </p>
        </div>
        {editing ? (
          <div className="flex shrink-0 gap-1.5">
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={save} disabled={invalid}>
              Save
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={startEditing}>
            <Pencil aria-hidden="true" />
            Edit rates
          </Button>
        )}
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-3">Zone</TableHead>
              <TableHead className="text-right">Base</TableHead>
              <TableHead className="pr-3 text-right">Per kg</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((rate, index) => (
              <TableRow
                key={rate.zone}
                className={editing ? "hover:bg-transparent" : undefined}
              >
                <TableCell className="pl-3">
                  <p className="font-medium">{rate.zone}</p>
                  <p className="text-xs text-muted-foreground">{rate.region}</p>
                </TableCell>
                {(["base", "perKg"] as const).map((field) => (
                  <TableCell
                    key={field}
                    className={
                      field === "perKg" ? "pr-3 text-right" : "text-right"
                    }
                  >
                    {editing ? (
                      <Input
                        inputMode="decimal"
                        aria-label={`${rate.zone} ${field === "base" ? "base rate" : "rate per kg"}`}
                        aria-invalid={!PRICE_PATTERN.test(rate[field])}
                        value={rate[field]}
                        onChange={(event) =>
                          updateDraft(index, field, event.target.value)
                        }
                        className="ml-auto h-7 w-20 text-right tabular-nums"
                      />
                    ) : (
                      <span className="inline-block py-1 tabular-nums">
                        ${rate[field]}
                      </span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {editing && invalid ? (
        <p role="alert" className="text-sm text-destructive">
          Enter prices as numbers with up to two decimals, like 12.50.
        </p>
      ) : null}
    </div>
  );
}
