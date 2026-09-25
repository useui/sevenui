"use client";

import * as React from "react";
import { PackageSearchIcon, SlidersHorizontalIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "@/registry/base/ui/sidebar";
import { Slider } from "@/registry/base/ui/slider";
import { Switch } from "@/registry/base/ui/switch";

type Product = {
  id: string;
  name: string;
  category: "Beans" | "Brewers" | "Grinders";
  roast?: "Light" | "Medium" | "Dark";
  price: number;
  inStock: boolean;
};

const products: Product[] = [
  { id: "p1", name: "Ethiopia Guji", category: "Beans", roast: "Light", price: 19, inStock: true },
  { id: "p2", name: "Colombia Huila", category: "Beans", roast: "Medium", price: 17, inStock: true },
  { id: "p3", name: "Sumatra Mandheling", category: "Beans", roast: "Dark", price: 18, inStock: false },
  { id: "p4", name: "Kenya Nyeri AA", category: "Beans", roast: "Light", price: 24, inStock: true },
  { id: "p5", name: "Glass pour-over set", category: "Brewers", price: 42, inStock: true },
  { id: "p6", name: "Steel French press", category: "Brewers", price: 55, inStock: false },
  { id: "p7", name: "Hand grinder, conical burr", category: "Grinders", price: 89, inStock: true },
  { id: "p8", name: "Electric flat-burr grinder", category: "Grinders", price: 179, inStock: true },
];

const categories = ["All", "Beans", "Brewers", "Grinders"] as const;
const roasts = ["Light", "Medium", "Dark"] as const;
const PRICE_MIN = 0;
const PRICE_MAX = 200;

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function Sidebar15() {
  const [category, setCategory] = React.useState<(typeof categories)[number]>("All");
  const [price, setPrice] = React.useState<number[]>([PRICE_MIN, PRICE_MAX]);
  const [roastFilter, setRoastFilter] = React.useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);

  const matchesExceptCategory = (product: Product) =>
    product.price >= price[0] &&
    product.price <= price[1] &&
    (!inStockOnly || product.inStock) &&
    (roastFilter.length === 0 ||
      product.category !== "Beans" ||
      (product.roast !== undefined && roastFilter.includes(product.roast)));

  const results = products.filter(
    (product) =>
      matchesExceptCategory(product) &&
      (category === "All" || product.category === category),
  );

  const isFiltered =
    category !== "All" ||
    price[0] !== PRICE_MIN ||
    price[1] !== PRICE_MAX ||
    roastFilter.length > 0 ||
    inStockOnly;

  function clear() {
    setCategory("All");
    setPrice([PRICE_MIN, PRICE_MAX]);
    setRoastFilter([]);
    setInStockOnly(false);
  }

  return (
    <div className="@container w-full max-w-3xl overflow-hidden rounded-xl border bg-background">
      <SidebarProvider className="min-h-0 flex-col @xl:h-[520px] @xl:flex-row">
        <div className="flex items-center justify-between gap-2 border-b p-3 @xl:hidden">
          <Button
            variant="outline"
            size="sm"
            aria-expanded={showFilters}
            aria-controls="sidebar-15-filters"
            onClick={() => setShowFilters((value) => !value)}
          >
            <SlidersHorizontalIcon aria-hidden="true" />
            {showFilters ? "Hide filters" : "Filters"}
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums">
            {results.length} {results.length === 1 ? "result" : "results"}
          </span>
        </div>
        <Sidebar
          id="sidebar-15-filters"
          collapsible="none"
          role="region"
          aria-label="Product filters"
          className={
            showFilters
              ? "w-full border-b @xl:w-60 @xl:border-r @xl:border-b-0"
              : "hidden w-full border-b @xl:flex @xl:w-60 @xl:border-r @xl:border-b-0"
          }
        >
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Category</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {categories.map((item) => {
                    const count = products.filter(
                      (product) =>
                        matchesExceptCategory(product) &&
                        (item === "All" || product.category === item),
                    ).length;
                    return (
                      <SidebarMenuItem key={item}>
                        <SidebarMenuButton
                          isActive={item === category}
                          aria-pressed={item === category}
                          onClick={() => setCategory(item)}
                        >
                          <span>{item === "All" ? "All products" : item}</span>
                        </SidebarMenuButton>
                        <SidebarMenuBadge className="text-sidebar-foreground/60">
                          {count}
                        </SidebarMenuBadge>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel id="sidebar-15-price">Price</SidebarGroupLabel>
              <SidebarGroupContent className="flex flex-col gap-3 px-2 pt-1">
                <Slider
                  aria-labelledby="sidebar-15-price"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={5}
                  value={price}
                  onValueChange={(value) =>
                    setPrice(Array.isArray(value) ? [...value] : [value, value])
                  }
                />
                <div className="flex justify-between text-xs text-sidebar-foreground/70 tabular-nums">
                  <span>{money.format(price[0])}</span>
                  <span>
                    {money.format(price[1])}
                    {price[1] === PRICE_MAX ? "+" : ""}
                  </span>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Roast level</SidebarGroupLabel>
              <SidebarGroupContent className="flex flex-col gap-2.5 px-2 pt-1">
                {roasts.map((roast) => (
                  <label
                    key={roast}
                    htmlFor={`sidebar-15-roast-${roast}`}
                    className="flex items-center gap-2.5 text-sm"
                  >
                    <Checkbox
                      id={`sidebar-15-roast-${roast}`}
                      checked={roastFilter.includes(roast)}
                      onCheckedChange={(checked) =>
                        setRoastFilter((current) =>
                          checked
                            ? [...current, roast]
                            : current.filter((value) => value !== roast),
                        )
                      }
                    />
                    {roast}
                  </label>
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupContent className="px-2">
                <label
                  htmlFor="sidebar-15-in-stock"
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  In stock only
                  <Switch
                    id="sidebar-15-in-stock"
                    checked={inStockOnly}
                    onCheckedChange={setInStockOnly}
                  />
                </label>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border">
            <Button variant="ghost" size="sm" disabled={!isFiltered} onClick={clear}>
              Clear all filters
            </Button>
          </SidebarFooter>
        </Sidebar>
        <section
          aria-labelledby="sidebar-15-title"
          className="flex min-w-0 flex-1 flex-col overflow-y-auto"
        >
          <header className="flex items-baseline justify-between gap-2 px-4 pt-4">
            <h2 id="sidebar-15-title" className="text-sm font-semibold">
              {category === "All" ? "All products" : category}
            </h2>
            <p
              className="hidden text-xs text-muted-foreground tabular-nums @xl:block"
              aria-live="polite"
            >
              {results.length} {results.length === 1 ? "result" : "results"}
            </p>
          </header>
          {results.length === 0 ? (
            <div className="m-auto flex max-w-60 flex-col items-center gap-2 p-8 text-center">
              <PackageSearchIcon className="size-5 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm font-medium">No products match these filters</p>
              <Button variant="outline" size="sm" onClick={clear}>
                Clear filters
              </Button>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 p-4 @2xl:grid-cols-3">
              {results.map((product) => (
                <li key={product.id} className="flex min-w-0 flex-col gap-2">
                  <img
                    src="/placeholder.svg"
                    alt=""
                    className="aspect-square w-full rounded-lg border bg-muted object-cover"
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="truncate text-sm font-medium">{product.name}</span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground tabular-nums">
                        {money.format(product.price)}
                      </span>
                      {product.roast && <span>· {product.roast} roast</span>}
                    </span>
                    {!product.inStock && (
                      <span className="text-xs text-muted-foreground">Back in 2 weeks</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </SidebarProvider>
    </div>
  );
}
