"use client";

import * as React from "react";
import { CoffeeIcon, PlusIcon, TagIcon } from "lucide-react";

import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/registry/base/ui/combobox";
import { InputGroupAddon } from "@/registry/base/ui/input-group";
import { Label } from "@/registry/base/ui/label";

type Category = { value: string; label: string; created?: boolean };

const initialCategories: Category[] = [
  { value: "meals", label: "Meals & entertainment" },
  { value: "travel", label: "Travel" },
  { value: "software", label: "Software subscriptions" },
  { value: "office", label: "Office supplies" },
  { value: "hardware", label: "Hardware" },
  { value: "education", label: "Training & education" },
];

// Placeholder id for the "Create …" row; replaced with a real id on select.
const CREATE_ID = "__create__";

function slugify(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

export default function Combobox09() {
  const [categories, setCategories] = React.useState(initialCategories);
  const [category, setCategory] = React.useState<Category | null>(null);
  const [query, setQuery] = React.useState("");
  const [remember, setRemember] = React.useState(true);

  const trimmed = query.trim();
  const exists = categories.some(
    (item) => item.label.toLowerCase() === trimmed.toLowerCase(),
  );
  // Offer a create row whenever the typed text is not an existing category.
  const items: Category[] =
    trimmed && !exists
      ? [...categories, { value: CREATE_ID, label: trimmed }]
      : categories;

  const handleChange = (next: Category | null) => {
    if (next?.value === CREATE_ID) {
      const created = { value: slugify(next.label), label: next.label, created: true };
      setCategories((current) => [...current, created]);
      setCategory(created);
      return;
    }
    setCategory(next);
  };

  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-4 text-card-foreground">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
          <CoffeeIcon aria-hidden="true" className="size-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">Blue Bottle Coffee</p>
          <p className="text-xs text-muted-foreground">Sep 22 · Visa ending 4417</p>
        </div>
        <p className="text-sm font-medium tabular-nums">−$14.50</p>
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t pt-4">
        <Label htmlFor="combobox-09-category">Category</Label>
        <Combobox
          items={items}
          value={category}
          onValueChange={handleChange}
          onInputValueChange={setQuery}
        >
          <ComboboxInput
            id="combobox-09-category"
            placeholder="Pick or create one"
            className="w-full"
          >
            <InputGroupAddon align="inline-start">
              <TagIcon aria-hidden="true" />
            </InputGroupAddon>
          </ComboboxInput>
          <ComboboxContent>
            <ComboboxEmpty>Start typing to name a new category.</ComboboxEmpty>
            <ComboboxList>
              {(item: Category) =>
                item.value === CREATE_ID ? (
                  <ComboboxItem
                    key={item.value}
                    value={item}
                    className="border-t border-border text-muted-foreground"
                  >
                    <PlusIcon aria-hidden="true" />
                    <span className="truncate">
                      Create{" "}
                      <span className="font-medium text-foreground">
                        “{item.label}”
                      </span>
                    </span>
                  </ComboboxItem>
                ) : (
                  <ComboboxItem key={item.value} value={item}>
                    <span className="truncate">{item.label}</span>
                    {item.created ? (
                      <span className="ml-auto text-xs text-muted-foreground">
                        New
                      </span>
                    ) : null}
                  </ComboboxItem>
                )
              }
            </ComboboxList>
          </ComboboxContent>
        </Combobox>

        <div className="mt-1 flex items-center gap-2">
          <Checkbox
            id="combobox-09-remember"
            checked={remember}
            onCheckedChange={setRemember}
          />
          <Label htmlFor="combobox-09-remember" className="font-normal">
            Always use this for Blue Bottle Coffee
          </Label>
        </div>
      </div>

      <p aria-live="polite" className="mt-4 text-xs text-muted-foreground">
        {category
          ? category.created
            ? `Created “${category.label}” and filed this expense under it.`
            : `Filed under ${category.label}.`
          : "Uncategorized expenses are flagged in the monthly report."}
      </p>
    </div>
  );
}
