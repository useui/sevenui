"use client";

import * as React from "react";
import { cn } from "cn";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/registry/base/ui/avatar";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/registry/base/ui/carousel";

const testimonials = [
  {
    company: "Brightline",
    quote:
      "We moved 40 engineers off three separate trackers in a week. Nobody asked to go back.",
    name: "Amara Osei",
    initials: "AO",
    role: "VP Engineering",
  },
  {
    company: "Paperfold",
    quote:
      "Release notes used to take me a full afternoon. Now they write themselves from merged work.",
    name: "Tomás Rivera",
    initials: "TR",
    role: "Product Manager",
  },
  {
    company: "Kestrel Labs",
    quote:
      "SCIM provisioning was the reason we signed. The keyboard shortcuts are why the team stayed.",
    name: "Hannah Lindqvist",
    initials: "HL",
    role: "Head of IT",
  },
  {
    company: "Oakridge Health",
    quote:
      "Audit log export turned our compliance review from a two-week scramble into a single download.",
    name: "Samuel Adeyemi",
    initials: "SA",
    role: "Security Lead",
  },
];

export default function Carousel08() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  return (
    <section
      aria-labelledby="carousel-08-title"
      className="flex w-full max-w-xl flex-col gap-5"
    >
      <h3
        id="carousel-08-title"
        className="text-center text-lg font-semibold text-balance"
      >
        Teams that switched this year
      </h3>
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        aria-labelledby="carousel-08-title"
      >
        <CarouselContent>
          {testimonials.map((item, index) => {
            const active = index === current;
            return (
              <CarouselItem
                key={item.company}
                aria-label={`${index + 1} of ${testimonials.length}: ${item.company}`}
                className="basis-[85%] sm:basis-2/3"
              >
                <figure
                  className={cn(
                    "flex h-full flex-col justify-between gap-6 rounded-xl border bg-card p-5 text-card-foreground transition-[opacity,scale] duration-300 ease-out motion-reduce:transition-none",
                    active ? "opacity-100" : "scale-95 opacity-40",
                  )}
                >
                  <blockquote className="text-base leading-relaxed text-pretty">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                  <figcaption className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg" alt="" />
                      <AvatarFallback>{item.initials}</AvatarFallback>
                    </Avatar>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">
                        {item.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {item.role}, {item.company}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
      <nav
        aria-label="Choose a customer story"
        className="flex flex-wrap justify-center gap-x-1 gap-y-1"
      >
        {testimonials.map((item, index) => (
          <button
            key={item.company}
            type="button"
            aria-current={index === current ? "true" : undefined}
            onClick={() => api?.scrollTo(index)}
            className="rounded-md px-2.5 py-1.5 text-sm font-semibold text-muted-foreground transition-colors outline-none decoration-2 underline-offset-8 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-current:text-foreground aria-current:underline"
          >
            {item.company}
          </button>
        ))}
      </nav>
    </section>
  );
}
