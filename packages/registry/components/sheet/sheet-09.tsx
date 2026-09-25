"use client";

import * as React from "react";
import { SlidersHorizontal } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import { Label } from "@/registry/base/ui/label";
import { Separator } from "@/registry/base/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/base/ui/sheet";
import { Slider } from "@/registry/base/ui/slider";
import { Switch } from "@/registry/base/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

const categories = [
  { value: "running", label: "Running shoes", count: 42 },
  { value: "trail", label: "Trail shoes", count: 18 },
  { value: "training", label: "Training shoes", count: 27 },
  { value: "sandals", label: "Recovery sandals", count: 9 },
];

const sizes = ["7", "8", "9", "10", "11", "12"];

const PRICE_MIN = 40;
const PRICE_MAX = 260;

type Filters = {
  categories: string[];
  price: number[];
  sizes: string[];
  inStock: boolean;
};

const defaultFilters: Filters = {
  categories: [],
  price: [PRICE_MIN, PRICE_MAX],
  sizes: [],
  inStock: false,
};

function countActive(filters: Filters) {
  let count = filters.categories.length + filters.sizes.length;
  if (filters.price[0] !== PRICE_MIN || filters.price[1] !== PRICE_MAX) {
    count += 1;
  }
  if (filters.inStock) count += 1;
  return count;
}

function estimateResults(filters: Filters) {
  const base =
    filters.categories.length === 0
      ? 96
      : categories
          .filter((category) => filters.categories.includes(category.value))
          .reduce((sum, category) => sum + category.count, 0);
  const priceShare =
    (filters.price[1] - filters.price[0]) / (PRICE_MAX - PRICE_MIN);
  const sizeShare = filters.sizes.length === 0 ? 1 : filters.sizes.length / 6;
  const stockShare = filters.inStock ? 0.8 : 1;
  return Math.round(base * priceShare * sizeShare * stockShare);
}

export default function Sheet09() {
  const [open, setOpen] = React.useState(false);
  const [applied, setApplied] = React.useState<Filters>({
    ...defaultFilters,
    categories: ["running"],
  });
  const [draft, setDraft] = React.useState<Filters>(applied);

  const activeCount = countActive(applied);
  const draftResults = estimateResults(draft);

  const handleOpenChange = (next: boolean) => {
    if (next) setDraft(applied);
    setOpen(next);
  };

  const toggleCategory = (value: string, checked: boolean) =>
    setDraft((current) => ({
      ...current,
      categories: checked
        ? [...current.categories, value]
        : current.categories.filter((item) => item !== value),
    }));

  const apply = () => {
    setApplied(draft);
    setOpen(false);
  };

  return (
    <div className="flex w-full max-w-md items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground tabular-nums">
          {estimateResults(applied)}
        </span>{" "}
        products
      </p>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetTrigger render={<Button variant="outline" size="sm" />}>
          <SlidersHorizontal aria-hidden="true" data-icon="inline-start" />
          Filters
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-0.5 tabular-nums">
              {activeCount}
            </Badge>
          )}
        </SheetTrigger>
        <SheetContent side="left" className="gap-0">
          <SheetHeader className="border-b pr-12">
            <SheetTitle>Filter products</SheetTitle>
            <SheetDescription>
              Narrow the catalog, then show the matching products.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
            <fieldset className="grid gap-3">
              <legend className="mb-3 text-sm font-medium">Category</legend>
              {categories.map((category) => {
                const id = `sheet-09-${category.value}`;
                return (
                  <div key={category.value} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={draft.categories.includes(category.value)}
                      onCheckedChange={(checked) =>
                        toggleCategory(category.value, checked)
                      }
                    />
                    <Label htmlFor={id} className="flex-1 font-normal">
                      {category.label}
                    </Label>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {category.count}
                    </span>
                  </div>
                );
              })}
            </fieldset>
            <Separator />
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span id="sheet-09-price" className="text-sm font-medium">
                  Price
                </span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  ${draft.price[0]} – ${draft.price[1]}
                </span>
              </div>
              <Slider
                aria-labelledby="sheet-09-price"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={10}
                minStepsBetweenValues={2}
                value={draft.price}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    price: Array.isArray(value) ? [...value] : [value, value],
                  }))
                }
              />
            </div>
            <Separator />
            <div className="grid gap-3">
              <span id="sheet-09-size" className="text-sm font-medium">
                US size
              </span>
              <ToggleGroup
                aria-labelledby="sheet-09-size"
                variant="outline"
                spacing={1}
                multiple
                value={draft.sizes}
                onValueChange={(value) =>
                  setDraft((current) => ({ ...current, sizes: value }))
                }
                className="grid w-full grid-cols-6"
              >
                {sizes.map((size) => (
                  <ToggleGroupItem
                    key={size}
                    value={size}
                    aria-label={`Size ${size}`}
                  >
                    {size}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div className="grid gap-0.5">
                <Label htmlFor="sheet-09-stock">In stock only</Label>
                <p className="text-xs text-muted-foreground">
                  Hide items that ship in 2+ weeks.
                </p>
              </div>
              <Switch
                id="sheet-09-stock"
                checked={draft.inStock}
                onCheckedChange={(checked) =>
                  setDraft((current) => ({ ...current, inStock: checked }))
                }
              />
            </div>
          </div>
          <SheetFooter className="flex-col-reverse border-t sm:flex-row">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setDraft(defaultFilters)}
              disabled={countActive(draft) === 0}
            >
              Clear all
            </Button>
            <Button className="flex-1" onClick={apply}>
              Show {draftResults} {draftResults === 1 ? "product" : "products"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
