"use client";

import { cn } from "cn";
import { ShoppingBag } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/registry/base/ui/navigation-menu";

const departments = [
  {
    title: "Women",
    categories: [
      "New arrivals",
      "Knitwear",
      "Coats & jackets",
      "Trousers",
      "Shoes",
    ],
    featured: {
      name: "Merino crewneck",
      price: "$88",
      note: "Back in stock in 6 colors",
    },
  },
  {
    title: "Men",
    categories: ["New arrivals", "Overshirts", "Chinos", "Outerwear", "Boots"],
    featured: {
      name: "Waxed field jacket",
      price: "$240",
      note: "Water-resistant, made in Portugal",
    },
  },
];

const anchor = (value: string) =>
  `#${value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;

export default function NavigationMenu10() {
  return (
    <header className="flex w-full max-w-2xl items-center justify-between gap-2 rounded-xl border bg-card px-3 py-2 text-card-foreground">
      <span className="hidden text-sm font-semibold tracking-tight sm:inline">
        Northfold
      </span>
      <NavigationMenu aria-label="Shop">
        <NavigationMenuList>
          {departments.map((department) => (
            <NavigationMenuItem key={department.title}>
              <NavigationMenuTrigger>{department.title}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid w-72 gap-3 p-2 sm:w-[30rem] sm:grid-cols-[1fr_12rem]">
                  <div>
                    <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">
                      Shop {department.title.toLowerCase()}
                    </p>
                    <ul className="grid grid-cols-2 gap-0.5 sm:grid-cols-1">
                      {department.categories.map((category) => (
                        <li key={category}>
                          <NavigationMenuLink
                            closeOnClick
                            href={anchor(`${department.title} ${category}`)}
                            className="py-1.5"
                          >
                            {category}
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <NavigationMenuLink
                    closeOnClick
                    href="#featured"
                    className="flex-col items-stretch gap-2 rounded-lg bg-muted/50 p-2"
                  >
                    <img
                      src="/placeholder.svg"
                      alt=""
                      className="aspect-[4/3] w-full rounded-md bg-muted object-cover"
                    />
                    <span className="flex items-start justify-between gap-2">
                      <span className="flex flex-col">
                        <span className="font-medium">
                          {department.featured.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {department.featured.note}
                        </span>
                      </span>
                      <span className="font-medium tabular-nums">
                        {department.featured.price}
                      </span>
                    </span>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ))}
          <NavigationMenuItem>
            <NavigationMenuLink
              href="#sale"
              className={cn(navigationMenuTriggerStyle(), "flex-row gap-1.5")}
            >
              Sale
              <Badge variant="destructive" className="hidden sm:inline-flex">
                −30%
              </Badge>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        aria-label="Shopping bag, 2 items"
      >
        <ShoppingBag aria-hidden="true" />
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[0.625rem] font-semibold text-primary-foreground tabular-nums"
        >
          2
        </span>
      </Button>
    </header>
  );
}
