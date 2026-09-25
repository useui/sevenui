"use client";

import { Badge } from "@/registry/base/ui/badge";

type Product = {
  name: string;
  color: string;
  price: number;
  salePrice?: number;
  isNew?: boolean;
  stock: number;
};

const products: Product[] = [
  {
    name: "Merino crew sweater",
    color: "Oatmeal",
    price: 120,
    salePrice: 90,
    stock: 24,
  },
  {
    name: "Waxed canvas tote",
    color: "Olive",
    price: 85,
    isNew: true,
    stock: 3,
  },
  {
    name: "Wool felt slippers",
    color: "Charcoal",
    price: 64,
    stock: 0,
  },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function Badge09() {
  return (
    <ul className="grid w-full max-w-2xl grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3">
      {products.map((product) => {
        const soldOut = product.stock === 0;
        const lowStock = product.stock > 0 && product.stock <= 5;
        const discount = product.salePrice
          ? Math.round((1 - product.salePrice / product.price) * 100)
          : 0;
        return (
          <li key={product.name} className="flex min-w-0 flex-col gap-2">
            <div className="relative overflow-hidden rounded-lg bg-muted">
              <img
                src="/placeholder.svg"
                alt={`${product.name} in ${product.color}`}
                width={400}
                height={400}
                className={`aspect-square w-full object-cover ${soldOut ? "opacity-50 grayscale" : ""}`}
              />
              <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
                {discount > 0 ? (
                  <Badge
                    variant="destructive"
                    className="bg-destructive text-background tabular-nums dark:bg-destructive"
                  >
                    <span aria-hidden="true">−{discount}%</span>
                    <span className="sr-only">{discount}% off</span>
                  </Badge>
                ) : null}
                {product.isNew ? <Badge>New</Badge> : null}
              </div>
              {soldOut ? (
                <Badge
                  variant="secondary"
                  className="absolute inset-x-2 bottom-2 w-auto"
                >
                  Sold out
                </Badge>
              ) : null}
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <p className="truncate text-sm font-medium">{product.name}</p>
              <p className="text-xs text-muted-foreground">{product.color}</p>
              <p className="flex flex-wrap items-baseline gap-x-1.5 text-sm tabular-nums">
                {product.salePrice ? (
                  <>
                    <span className="font-medium text-destructive">
                      {currency.format(product.salePrice)}
                    </span>
                    <span className="text-xs text-muted-foreground line-through">
                      <span className="sr-only">was </span>
                      {currency.format(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="font-medium">
                    {currency.format(product.price)}
                  </span>
                )}
              </p>
              {lowStock ? (
                <Badge variant="outline" className="font-normal">
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-warning"
                  />
                  Only {product.stock} left
                </Badge>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
