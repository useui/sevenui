"use client";

import { RotateCwIcon } from "lucide-react";
import * as React from "react";

import { AspectRatio } from "@/registry/base/ui/aspect-ratio";
import { Button } from "@/registry/base/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/registry/base/ui/carousel";
import { Skeleton } from "@/registry/base/ui/skeleton";

const articles = [
  {
    title: "Designing forms people finish",
    source: "Field Notes",
    minutes: 8,
  },
  {
    title: "What we learned shipping dark mode twice",
    source: "Engineering Blog",
    minutes: 12,
  },
  {
    title: "A practical guide to optimistic UI",
    source: "Frontend Weekly",
    minutes: 6,
  },
  {
    title: "Pricing pages that answer the real question",
    source: "Growth Letters",
    minutes: 9,
  },
];

export default function Carousel05() {
  const [loading, setLoading] = React.useState(true);

  // Simulates a request: every refresh shows skeletons for a moment.
  React.useEffect(() => {
    if (!loading) return;
    const timeout = window.setTimeout(() => setLoading(false), 1400);
    return () => window.clearTimeout(timeout);
  }, [loading]);

  return (
    <section
      aria-labelledby="carousel-05-heading"
      aria-busy={loading}
      className="w-full max-w-md"
    >
      <div className="mb-3 flex items-center justify-between gap-4">
        <h3 id="carousel-05-heading" className="text-sm font-semibold">
          Recommended reading
        </h3>
        <Button
          variant="ghost"
          size="sm"
          disabled={loading}
          onClick={() => setLoading(true)}
        >
          <RotateCwIcon
            aria-hidden="true"
            data-icon="inline-start"
            className={loading ? "animate-spin" : undefined}
          />
          {loading ? "Loading" : "Refresh"}
        </Button>
      </div>
      <Carousel opts={{ align: "start" }} aria-label="Recommended reading">
        <CarouselContent>
          {articles.map((article, index) => (
            <CarouselItem
              key={article.title}
              aria-label={`${index + 1} of ${articles.length}`}
              className="basis-4/5 sm:basis-3/5"
            >
              {loading ? (
                <div className="flex flex-col gap-3" aria-hidden="true">
                  <Skeleton className="aspect-video w-full rounded-lg" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ) : (
                <article className="flex animate-in flex-col gap-3 duration-300 fade-in-0">
                  <AspectRatio
                    ratio={16 / 9}
                    className="overflow-hidden rounded-lg bg-muted"
                  >
                    <img
                      src="/placeholder.svg"
                      alt=""
                      className="size-full object-cover"
                    />
                  </AspectRatio>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-muted-foreground">
                      {article.source} · {article.minutes} min read
                    </p>
                    <h4 className="text-sm leading-snug font-medium text-balance">
                      <a
                        href={`#${article.title.toLowerCase().replaceAll(" ", "-")}`}
                        className="decoration-2 underline-offset-4 outline-none hover:underline focus-visible:underline focus-visible:decoration-ring"
                      >
                        {article.title}
                      </a>
                    </h4>
                  </div>
                </article>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="mt-4 flex justify-end gap-2">
          <CarouselPrevious
            className="static translate-y-0"
            {...(loading ? { disabled: true } : {})}
          />
          <CarouselNext
            className="static translate-y-0"
            {...(loading ? { disabled: true } : {})}
          />
        </div>
      </Carousel>
    </section>
  );
}
