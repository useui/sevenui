"use client";

import * as React from "react";
import { Bell, ChevronDown, Heart, ListPlus, ShoppingBag, Star } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";

const initialLists = [
  { id: "wishlist", name: "Wishlist", count: 12, saved: false },
  { id: "kitchen", name: "Kitchen refresh", count: 5, saved: true },
  { id: "gifts", name: "Gifts for Dad", count: 3, saved: false },
];

export default function DropdownMenu13() {
  const [lists, setLists] = React.useState(initialLists);
  const [priceAlert, setPriceAlert] = React.useState(false);
  const [added, setAdded] = React.useState(false);
  const savedIn = lists.filter((list) => list.saved);
  const isSaved = savedIn.length > 0;

  // "New list…" creates a list and saves the product to it right away.
  const createList = () =>
    setLists((prev) => {
      const created = prev.length - initialLists.length + 1;
      return [
        ...prev,
        {
          id: `list-${created}`,
          name: created === 1 ? "New list" : `New list ${created}`,
          count: 1,
          saved: true,
        },
      ];
    });

  const toggleList = (id: string, saved: boolean) =>
    setLists((prev) =>
      prev.map((list) =>
        list.id === id
          ? { ...list, saved, count: list.count + (saved ? 1 : -1) }
          : list,
      ),
    );

  return (
    <article className="w-full max-w-xs overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-xs">
      <img
        src="/placeholder.svg"
        alt="Matte stoneware pour-over coffee dripper on a walnut stand"
        className="aspect-[4/3] w-full bg-muted object-cover"
      />
      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-medium leading-snug">
              Stoneware pour-over set
            </h3>
            <p className="text-sm font-semibold tabular-nums">$64</p>
          </div>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star aria-hidden="true" className="size-3.5 fill-current" />
            <span>4.8 · 1,204 reviews · Ships in 2 days</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => setAdded(true)}>
            <ShoppingBag aria-hidden="true" data-icon="inline-start" />
            {added ? "Added to bag" : "Add to bag"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  aria-label={
                    isSaved
                      ? `Saved to ${savedIn.map((list) => list.name).join(", ")}. Change lists`
                      : "Save to a list"
                  }
                >
                  <Heart
                    aria-hidden="true"
                    data-saved={isSaved || undefined}
                    className="transition-colors data-saved:fill-destructive data-saved:text-destructive"
                    data-icon="inline-start"
                  />
                  {isSaved ? "Saved" : "Save"}
                  <ChevronDown aria-hidden="true" data-icon="inline-end" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Save to list</DropdownMenuLabel>
                {lists.map((list) => (
                  <DropdownMenuCheckboxItem
                    key={list.id}
                    checked={list.saved}
                    onCheckedChange={(checked) => toggleList(list.id, checked)}
                  >
                    <span className="flex-1 truncate">{list.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {list.count}
                    </span>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuItem closeOnClick={false} onClick={createList}>
                <ListPlus aria-hidden="true" />
                New list…
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={priceAlert}
                onCheckedChange={setPriceAlert}
              >
                <Bell aria-hidden="true" />
                Alert me when price drops
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p aria-live="polite" className="min-h-4 text-xs text-muted-foreground">
          {isSaved
            ? `In ${savedIn.map((list) => list.name).join(" and ")}${priceAlert ? " · price alert on" : ""}`
            : priceAlert
              ? "Price alert on. We'll email you if it drops."
              : "Not saved to any list yet."}
        </p>
      </div>
    </article>
  );
}
