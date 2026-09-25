"use client";

import * as React from "react";

import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";
import { Label } from "@/registry/base/ui/label";

type Facet = {
  id: string;
  name: string;
  options: { value: string; count: number }[];
};

const facets: Facet[] = [
  {
    id: "category",
    name: "Category",
    options: [
      { value: "Trail runners", count: 42 },
      { value: "Road runners", count: 67 },
      { value: "Hiking boots", count: 28 },
    ],
  },
  {
    id: "size",
    name: "Size (US)",
    options: [
      { value: "8", count: 51 },
      { value: "9", count: 58 },
      { value: "10", count: 61 },
      { value: "11", count: 39 },
    ],
  },
  {
    id: "width",
    name: "Width",
    options: [
      { value: "Regular", count: 104 },
      { value: "Wide", count: 33 },
    ],
  },
];

const catalogSize = 137;

const slug = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export default function Collapsible03() {
  const [selected, setSelected] = React.useState<Record<string, string[]>>({
    category: ["Trail runners"],
    size: ["9", "10"],
  });

  const total = Object.values(selected).reduce(
    (sum, values) => sum + values.length,
    0,
  );

  // Rough result estimate: each facet with a selection narrows the catalog
  // by the share of products its selected options cover.
  const results = Math.round(
    facets.reduce((estimate, facet) => {
      const values = selected[facet.id] ?? [];
      if (values.length === 0) return estimate;
      const all = facet.options.reduce((sum, option) => sum + option.count, 0);
      const picked = facet.options
        .filter((option) => values.includes(option.value))
        .reduce((sum, option) => sum + option.count, 0);
      return (estimate * picked) / all;
    }, catalogSize),
  );

  const toggle = (facetId: string, value: string, checked: boolean) => {
    setSelected((current) => {
      const values = current[facetId] ?? [];
      return {
        ...current,
        [facetId]: checked
          ? [...values, value]
          : values.filter((item) => item !== value),
      };
    });
  };

  return (
    <aside
      aria-labelledby="collapsible-03-title"
      className="flex w-full max-w-xs flex-col rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <h3 id="collapsible-03-title" className="text-sm font-semibold">
          Filters
        </h3>
        <Button
          variant="ghost"
          size="xs"
          disabled={total === 0}
          onClick={() => setSelected({})}
        >
          Clear all
        </Button>
      </header>
      <div className="flex flex-col divide-y">
        {facets.map((facet) => {
          const values = selected[facet.id] ?? [];
          return (
            <Collapsible key={facet.id} defaultOpen={facet.id !== "width"}>
              <CollapsibleTrigger className="group flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset">
                <span className="flex-1">{facet.name}</span>
                {values.length > 0 && (
                  <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground tabular-nums">
                    {values.length}
                    <span className="sr-only"> selected</span>
                  </span>
                )}
                <ChevronDownIcon
                  aria-hidden="true"
                  className="size-4 text-muted-foreground transition-transform duration-200 group-data-panel-open:rotate-180"
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <fieldset className="flex flex-col gap-2.5 px-4 pb-4">
                  <legend className="sr-only">{facet.name}</legend>
                  {facet.options.map((option) => {
                    const id = `collapsible-03-${facet.id}-${slug(
                      option.value,
                    )}`;
                    return (
                      <div
                        key={option.value}
                        className="flex items-center gap-2.5"
                      >
                        <Checkbox
                          id={id}
                          checked={values.includes(option.value)}
                          onCheckedChange={(checked) =>
                            toggle(facet.id, option.value, checked)
                          }
                        />
                        <Label htmlFor={id} className="flex-1 font-normal">
                          {option.value}
                        </Label>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {option.count}
                        </span>
                      </div>
                    );
                  })}
                </fieldset>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
      <footer className="border-t p-3">
        <Button className="w-full" disabled={results === 0}>
          {results === 0
            ? "No matching products"
            : `Show ${results} ${results === 1 ? "result" : "results"}`}
        </Button>
      </footer>
    </aside>
  );
}
