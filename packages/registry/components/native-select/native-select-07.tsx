"use client";

import * as React from "react";

import { Label } from "@/registry/base/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";
import { Spinner } from "@/registry/base/ui/spinner";

const countries = [
  { value: "de", label: "Germany" },
  { value: "jp", label: "Japan" },
  { value: "ca", label: "Canada" },
  { value: "is", label: "Iceland" },
];

// Stand-in for a server response; Iceland has no pickup points yet.
const warehousesByCountry: Record<string, string[]> = {
  de: ["Berlin Tempelhof", "Hamburg Harbor", "Munich East"],
  jp: ["Tokyo Koto", "Osaka Bay"],
  ca: ["Toronto Pearson", "Vancouver Richmond", "Montreal Dorval"],
  is: [],
};

export default function NativeSelect07() {
  const [country, setCountry] = React.useState("de");
  const [warehouse, setWarehouse] = React.useState("Berlin Tempelhof");
  const [warehouses, setWarehouses] = React.useState<string[]>(
    warehousesByCountry.de,
  );
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!loading) return;
    const timeout = window.setTimeout(() => {
      const next = warehousesByCountry[country] ?? [];
      setWarehouses(next);
      setWarehouse(next[0] ?? "");
      setLoading(false);
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [country, loading]);

  const empty = !loading && warehouses.length === 0;

  return (
    <div className="flex w-full max-w-xs flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="native-select-07-country">Country</Label>
        <NativeSelect
          id="native-select-07-country"
          className="w-full"
          value={country}
          onChange={(event) => {
            setCountry(event.target.value);
            setLoading(true);
          }}
        >
          {countries.map((item) => (
            <NativeSelectOption key={item.value} value={item.value}>
              {item.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="native-select-07-warehouse">Pickup warehouse</Label>
        <div className="relative">
          <NativeSelect
            id="native-select-07-warehouse"
            className={loading ? "w-full [&>svg]:hidden" : "w-full"}
            value={loading || empty ? "" : warehouse}
            disabled={loading || empty}
            aria-busy={loading || undefined}
            aria-describedby="native-select-07-status"
            onChange={(event) => setWarehouse(event.target.value)}
          >
            {loading ? (
              <NativeSelectOption value="">Loading warehouses…</NativeSelectOption>
            ) : empty ? (
              <NativeSelectOption value="">No warehouses available</NativeSelectOption>
            ) : (
              warehouses.map((item) => (
                <NativeSelectOption key={item} value={item}>
                  {item}
                </NativeSelectOption>
              ))
            )}
          </NativeSelect>
          {loading ? (
            <Spinner
              aria-hidden="true"
              role="presentation"
              className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground"
            />
          ) : null}
        </div>
        <p
          id="native-select-07-status"
          aria-live="polite"
          className="text-sm text-muted-foreground"
        >
          {loading
            ? "Checking which warehouses ship to this country."
            : empty
              ? "Iceland orders ship directly from our Dublin hub."
              : `${warehouses.length} warehouses offer same-day pickup.`}
        </p>
      </div>
    </div>
  );
}
