"use client";

import * as React from "react";
import { GlobeIcon, LockIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/registry/base/ui/item";

const repositories = [
  {
    id: "storefront",
    name: "northwind/storefront",
    detail: "TypeScript · Updated 2 hours ago",
    isPrivate: true,
  },
  {
    id: "payments",
    name: "northwind/payments-service",
    detail: "Go · Updated yesterday",
    isPrivate: true,
  },
  {
    id: "design-tokens",
    name: "northwind/design-tokens",
    detail: "JSON · Updated 3 days ago",
    isPrivate: false,
  },
  {
    id: "infra",
    name: "northwind/infra",
    detail: "HCL · Updated last week",
    isPrivate: true,
  },
];

export default function Item07() {
  const id = React.useId();
  const [selected, setSelected] = React.useState<string[]>(["storefront"]);
  const [imported, setImported] = React.useState<string[]>([]);

  const allSelected = selected.length === repositories.length;
  const someSelected = selected.length > 0 && !allSelected;

  function toggle(id: string, checked: boolean) {
    setImported([]);
    setSelected((current) =>
      checked ? [...current, id] : current.filter((value) => value !== id),
    );
  }

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-xl border bg-card text-card-foreground">
      <Item size="sm" className="relative rounded-none border-b-border">
        <ItemMedia>
          <Checkbox
            id={`${id}-all`}
            className="relative z-10 data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground data-indeterminate:before:h-0.5 data-indeterminate:before:w-2 data-indeterminate:before:rounded-full data-indeterminate:before:bg-current data-indeterminate:[&_svg]:hidden"
            checked={allSelected}
            indeterminate={someSelected}
            onCheckedChange={(checked) => {
              setImported([]);
              setSelected(
                checked ? repositories.map((repository) => repository.id) : [],
              );
            }}
          />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>
            <label
              htmlFor={`${id}-all`}
              className="cursor-pointer after:absolute after:inset-0"
            >
              Select all repositories
            </label>
          </ItemTitle>
        </ItemContent>
      </Item>
      <ItemGroup aria-label="Repositories" className="gap-0.5 p-1.5">
        {repositories.map((repository) => {
          const isChecked = selected.includes(repository.id);
          const VisibilityIcon = repository.isPrivate ? LockIcon : GlobeIcon;
          return (
            <Item
              key={repository.id}
              role="listitem"
              size="sm"
              className="relative hover:bg-muted/50 has-data-checked:bg-muted"
            >
              <ItemMedia>
                <Checkbox
                  id={`${id}-${repository.id}`}
                  className="relative z-10"
                  checked={isChecked}
                  onCheckedChange={(checked) => toggle(repository.id, checked)}
                />
              </ItemMedia>
              <ItemContent className="min-w-0 gap-0">
                <ItemTitle className="w-full">
                  <label
                    htmlFor={`${id}-${repository.id}`}
                    className="min-w-0 cursor-pointer truncate after:absolute after:inset-0"
                  >
                    {repository.name}
                  </label>
                </ItemTitle>
                <ItemDescription className="line-clamp-1 text-xs">
                  {repository.detail}
                </ItemDescription>
              </ItemContent>
              <VisibilityIcon
                role="img"
                aria-label={repository.isPrivate ? "Private" : "Public"}
                className="size-3.5 shrink-0 text-muted-foreground"
              />
            </Item>
          );
        })}
      </ItemGroup>
      <div className="flex items-center justify-between gap-2 border-t px-3 py-2.5">
        <p
          aria-live="polite"
          className="text-xs text-muted-foreground tabular-nums"
        >
          {imported.length > 0
            ? `Imported ${imported.length} ${imported.length === 1 ? "repository" : "repositories"}`
            : `${selected.length} of ${repositories.length} selected`}
        </p>
        <Button
          size="sm"
          disabled={selected.length === 0}
          onClick={() => {
            setImported(selected);
            setSelected([]);
          }}
        >
          {selected.length > 1
            ? `Import ${selected.length} repositories`
            : "Import repository"}
        </Button>
      </div>
    </div>
  );
}
