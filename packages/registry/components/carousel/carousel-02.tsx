"use client";

import { AspectRatio } from "@/registry/base/ui/aspect-ratio";
import { Badge } from "@/registry/base/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/registry/base/ui/carousel";

const products = [
  { name: "Linen overshirt", price: "$89", tag: "New" },
  { name: "Merino crew sweater", price: "$120", tag: null },
  { name: "Canvas tote bag", price: "$38", tag: "Low stock" },
  { name: "Leather card holder", price: "$45", tag: null },
  { name: "Cotton twill cap", price: "$29", tag: "New" },
  { name: "Wool blend scarf", price: "$64", tag: null },
];

export default function Carousel02() {
  return (
    <Carousel
      opts={{ align: "start" }}
      aria-label="Recently viewed"
      className="w-full max-w-xl"
    >
      <div className="mb-3 flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold">Recently viewed</h3>
        <div className="flex items-center gap-1">
          <CarouselPrevious
            variant="ghost"
            className="static translate-y-0 rounded-md"
          />
          <CarouselNext
            variant="ghost"
            className="static translate-y-0 rounded-md"
          />
        </div>
      </div>
      <CarouselContent className="-ml-3">
        {products.map((product, index) => (
          <CarouselItem
            key={product.name}
            aria-label={`${index + 1} of ${products.length}`}
            className="basis-1/2 pl-3 sm:basis-1/3"
          >
            <a
              href={`#${product.name.toLowerCase().replaceAll(" ", "-")}`}
              className="group/product flex flex-col gap-2 rounded-lg outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            >
              <AspectRatio
                ratio={4 / 5}
                className="overflow-hidden rounded-lg bg-muted"
              >
                <img
                  src="/placeholder.svg"
                  alt={product.name}
                  className="size-full object-cover transition-transform duration-500 ease-out group-hover/product:scale-105"
                />
                {product.tag ? (
                  <Badge
                    variant={product.tag === "New" ? "default" : "secondary"}
                    className="absolute top-2 left-2"
                  >
                    {product.tag}
                  </Badge>
                ) : null}
              </AspectRatio>
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="min-w-0 truncate font-medium">
                  {product.name}
                </span>
                <span className="shrink-0 text-muted-foreground tabular-nums">
                  {product.price}
                </span>
              </div>
            </a>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
