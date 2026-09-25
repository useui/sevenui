"use client";

import { useId, useState } from "react";
import { XIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import { Label } from "@/registry/base/ui/label";
import { Separator } from "@/registry/base/ui/separator";

type Product = {
  brand: string;
  material: string;
  inStock: boolean;
};

// Sample catalog the facet counts are derived from.
const products: Product[] = [
  { brand: "Arket", material: "Linen", inStock: true },
  { brand: "Arket", material: "Cotton", inStock: true },
  { brand: "Arket", material: "Wool", inStock: false },
  { brand: "COS", material: "Cotton", inStock: true },
  { brand: "COS", material: "Wool", inStock: true },
  { brand: "COS", material: "Linen", inStock: false },
  { brand: "Everlane", material: "Cotton", inStock: true },
  { brand: "Everlane", material: "Cotton", inStock: true },
  { brand: "Everlane", material: "Cashmere", inStock: true },
  { brand: "Norse Projects", material: "Wool", inStock: true },
  { brand: "Norse Projects", material: "Cotton", inStock: false },
  { brand: "Norse Projects", material: "Linen", inStock: true },
];

const facets = [
  {
    key: "brand",
    label: "Brand",
    options: ["Arket", "COS", "Everlane", "Norse Projects"],
  },
  {
    key: "material",
    label: "Material",
    options: ["Cotton", "Linen", "Wool", "Cashmere"],
  },
] as const;

type FacetKey = (typeof facets)[number]["key"];
type Selection = Record<FacetKey, string[]>;

function matches(
  product: Product,
  selection: Selection,
  inStockOnly: boolean,
  skip?: FacetKey,
) {
  if (inStockOnly && !product.inStock) return false;
  return facets.every(({ key }) => {
    if (key === skip || selection[key].length === 0) return true;
    return selection[key].includes(product[key]);
  });
}

function slug(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

export default function Checkbox10() {
  const baseId = useId();
  const [selection, setSelection] = useState<Selection>({
    brand: ["COS"],
    material: [],
  });
  const [inStockOnly, setInStockOnly] = useState(false);

  const resultCount = products.filter((product) =>
    matches(product, selection, inStockOnly),
  ).length;
  const applied = facets.flatMap(({ key }) =>
    selection[key].map((value) => ({ key, value })),
  );

  function toggle(key: FacetKey, value: string, checked: boolean) {
    setSelection((prev) => ({
      ...prev,
      [key]: checked
        ? [...prev[key], value]
        : prev[key].filter((item) => item !== value),
    }));
  }

  return (
    <aside
      aria-label="Product filters"
      className="w-full max-w-xs rounded-xl border border-border bg-card p-4 text-card-foreground"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium">Filters</h3>
        <p
          aria-live="polite"
          className="text-xs text-muted-foreground tabular-nums"
        >
          {resultCount} {resultCount === 1 ? "result" : "results"}
        </p>
      </div>

      {applied.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {applied.map(({ key, value }) => (
            <Button
              key={`${key}-${value}`}
              variant="secondary"
              size="xs"
              aria-label={`Remove ${value} filter`}
              onClick={() => toggle(key, value, false)}
            >
              {value}
              <XIcon aria-hidden="true" data-icon="inline-end" />
            </Button>
          ))}
          <Button
            variant="link"
            size="xs"
            className="px-1"
            onClick={() => setSelection({ brand: [], material: [] })}
          >
            Clear all
          </Button>
        </div>
      ) : null}

      {facets.map((facet) => (
        <fieldset key={facet.key} className="mt-4">
          <legend className="mb-2 text-xs font-medium text-muted-foreground">
            {facet.label}
          </legend>
          <div className="flex flex-col gap-0.5">
            {facet.options.map((option) => {
              // Count what this option would show given the other facets.
              const count = products.filter(
                (product) =>
                  product[facet.key] === option &&
                  matches(product, selection, inStockOnly, facet.key),
              ).length;
              const checked = selection[facet.key].includes(option);
              const id = `${baseId}-${facet.key}-${slug(option)}`;
              return (
                <div
                  key={option}
                  className="-mx-2 flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted/60"
                >
                  <Checkbox
                    id={id}
                    checked={checked}
                    disabled={count === 0 && !checked}
                    onCheckedChange={(value) =>
                      toggle(facet.key, option, value)
                    }
                  />
                  <Label
                    htmlFor={id}
                    className="flex-1 font-normal peer-data-disabled:text-muted-foreground"
                  >
                    {option}
                  </Label>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}

      <Separator className="my-4" />

      <div className="flex items-center gap-2.5">
        <Checkbox
          id={`${baseId}-in-stock`}
          checked={inStockOnly}
          onCheckedChange={(value) => setInStockOnly(value)}
        />
        <Label htmlFor={`${baseId}-in-stock`} className="font-normal">
          Ready to ship only
        </Label>
      </div>
    </aside>
  );
}
