"use client";

import * as React from "react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/registry/base/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";

const catalog = [
  { name: "Stoneware mug", price: 28, color: "Sand" },
  { name: "Linen napkins, set of 4", price: 36, color: "Oat" },
  { name: "Walnut serving board", price: 74, color: "Walnut" },
  { name: "Glass carafe", price: 42, color: "Clear" },
  { name: "Enamel pour-over", price: 58, color: "Slate" },
  { name: "Ceramic bowl, large", price: 46, color: "Chalk" },
  { name: "Brass bottle opener", price: 24, color: "Brass" },
  { name: "Wool table runner", price: 68, color: "Moss" },
  { name: "Tumbler, set of 2", price: 32, color: "Smoke" },
  { name: "Olive wood spoon", price: 18, color: "Olive" },
  { name: "Cast iron skillet", price: 95, color: "Black" },
  { name: "Porcelain teapot", price: 64, color: "White" },
  { name: "Cork trivet", price: 16, color: "Natural" },
  { name: "Copper measuring cups", price: 52, color: "Copper" },
  { name: "Waffle dish towel", price: 14, color: "Rust" },
  { name: "Marble mortar", price: 48, color: "Carrara" },
  { name: "Speckled plate", price: 26, color: "Oat" },
  { name: "Bamboo steamer", price: 34, color: "Natural" },
  { name: "Salt cellar", price: 22, color: "Walnut" },
  { name: "Coffee canister", price: 38, color: "Slate" },
  { name: "Pasta bowl, set of 2", price: 54, color: "Sand" },
  { name: "Wine decanter", price: 88, color: "Clear" },
  { name: "Linen apron", price: 44, color: "Moss" },
  { name: "Butter dish", price: 30, color: "Chalk" },
  { name: "Herb scissors", price: 20, color: "Black" },
  { name: "Tea towel, set of 3", price: 27, color: "Rust" },
  { name: "Oak spice rack", price: 62, color: "Oak" },
  { name: "Ceramic vase", price: 56, color: "Smoke" },
  { name: "Pepper mill", price: 40, color: "Walnut" },
  { name: "Glass storage jar", price: 19, color: "Clear" },
];

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

const PAGE_SIZE = 4;

function pageRange(current: number, total: number) {
  const pages: (number | "ellipsis")[] = [];
  for (let number = 1; number <= total; number++) {
    if (number === 1 || number === total || Math.abs(number - current) <= 1) {
      pages.push(number);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }
  return pages;
}

export default function Pagination11() {
  const [sort, setSort] = React.useState("featured");
  const [page, setPage] = React.useState(1);
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  const sorted = [...catalog].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    return 0;
  });
  const pageCount = Math.ceil(sorted.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const visible = sorted.slice(start, start + PAGE_SIZE);

  function goTo(event: React.MouseEvent, next: number) {
    event.preventDefault();
    if (next < 1 || next > pageCount || next === page) return;
    setPage(next);
    // Move focus to the results heading so screen reader and keyboard
    // users land on the new products instead of the pager.
    headingRef.current?.focus();
  }

  return (
    <section aria-labelledby="catalog-title" className="w-full max-w-2xl">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="catalog-title"
            ref={headingRef}
            tabIndex={-1}
            className="rounded-sm text-lg font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Kitchen & dining
          </h2>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {start + 1}–{start + visible.length} of {catalog.length} products
          </p>
        </div>
        <Select
          items={sortOptions}
          value={sort}
          onValueChange={(value) => {
            if (value) {
              setSort(value);
              setPage(1);
            }
          }}
        >
          <SelectTrigger aria-label="Sort products" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4">
        {visible.map((product) => (
          <li key={product.name} className="group">
            <a
              href={`#${product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-lg bg-muted">
                <img
                  src="/placeholder.svg"
                  alt=""
                  className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                />
              </div>
              <p className="mt-2 truncate text-sm font-medium">
                {product.name}
              </p>
              <p className="flex justify-between text-sm text-muted-foreground">
                <span>{product.color}</span>
                <span className="font-medium text-foreground tabular-nums">
                  ${product.price}
                </span>
              </p>
            </a>
          </li>
        ))}
      </ul>

      <Pagination aria-label="Product pages" className="mt-8 border-t pt-4">
        <PaginationContent className="w-full">
          <PaginationItem className="mr-auto">
            <PaginationPrevious
              href="#"
              aria-disabled={page === 1}
              tabIndex={page === 1 ? -1 : undefined}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
              onClick={(event) => goTo(event, page - 1)}
            />
          </PaginationItem>
          <li className="px-2 text-sm text-muted-foreground tabular-nums sm:hidden">
            Page {page} of {pageCount}
          </li>
          {pageRange(page, pageCount).map((entry, index) =>
            entry === "ellipsis" ? (
              // biome-ignore lint/suspicious/noArrayIndexKey: ellipsis position is stable per render
              <PaginationItem key={`ellipsis-${index}`} className="hidden sm:block">
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={entry} className="hidden sm:block">
                <PaginationLink
                  href="#"
                  isActive={entry === page}
                  aria-label={`Page ${entry}`}
                  onClick={(event) => goTo(event, entry)}
                >
                  {entry}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
          <PaginationItem className="ml-auto">
            <PaginationNext
              href="#"
              aria-disabled={page === pageCount}
              tabIndex={page === pageCount ? -1 : undefined}
              className={
                page === pageCount ? "pointer-events-none opacity-50" : ""
              }
              onClick={(event) => goTo(event, page + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </section>
  );
}
