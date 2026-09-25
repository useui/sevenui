"use client";

import * as React from "react";

import { AspectRatio } from "@/registry/base/ui/aspect-ratio";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/registry/base/ui/carousel";

const photos = [
  { alt: "Living room with oak floors and a bay window" },
  { alt: "Open kitchen with a marble island" },
  { alt: "Primary bedroom facing the garden" },
  { alt: "Bathroom with a walk-in shower" },
  { alt: "Home office with built-in shelves" },
  { alt: "Back garden with a stone patio" },
];

export default function Carousel04() {
  const [mainApi, setMainApi] = React.useState<CarouselApi>();
  const [thumbApi, setThumbApi] = React.useState<CarouselApi>();
  const [selected, setSelected] = React.useState(0);

  React.useEffect(() => {
    if (!mainApi) return;
    const onSelect = () => {
      const index = mainApi.selectedScrollSnap();
      setSelected(index);
      thumbApi?.scrollTo(index);
    };
    onSelect();
    mainApi.on("select", onSelect);
    mainApi.on("reInit", onSelect);
    return () => {
      mainApi.off("select", onSelect);
      mainApi.off("reInit", onSelect);
    };
  }, [mainApi, thumbApi]);

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Carousel setApi={setMainApi} aria-label="Listing photos">
        <CarouselContent>
          {photos.map((photo, index) => (
            <CarouselItem
              key={photo.alt}
              aria-label={`${index + 1} of ${photos.length}`}
            >
              <AspectRatio
                ratio={4 / 3}
                className="overflow-hidden rounded-xl bg-muted"
              >
                <img
                  src="/placeholder.svg"
                  alt={photo.alt}
                  className="size-full object-cover"
                />
              </AspectRatio>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-3 border-0 bg-background/80 shadow-sm backdrop-blur-sm" />
        <CarouselNext className="right-3 border-0 bg-background/80 shadow-sm backdrop-blur-sm" />
        <span
          aria-live="polite"
          className="absolute right-3 bottom-3 rounded-md bg-background/80 px-2 py-0.5 text-xs font-medium tabular-nums shadow-sm backdrop-blur-sm"
        >
          {selected + 1} / {photos.length}
        </span>
      </Carousel>
      <Carousel
        setApi={setThumbApi}
        opts={{ containScroll: "keepSnaps", dragFree: true }}
        aria-label="Photo thumbnails"
      >
        <CarouselContent className="-ml-2">
          {photos.map((photo, index) => (
            <CarouselItem
              key={photo.alt}
              className="basis-1/4 pl-2 sm:basis-1/5"
            >
              <button
                type="button"
                aria-label={`Show photo ${index + 1}: ${photo.alt}`}
                aria-current={index === selected ? "true" : undefined}
                onClick={() => mainApi?.scrollTo(index)}
                className="block w-full overflow-hidden rounded-md border-2 border-transparent opacity-60 transition-[opacity,border-color] duration-200 outline-none hover:opacity-90 focus-visible:border-ring focus-visible:opacity-100 aria-current:border-primary aria-current:opacity-100"
              >
                <AspectRatio ratio={1} className="rounded-sm bg-muted">
                  <img
                    src="/placeholder.svg"
                    alt=""
                    className="size-full object-cover"
                  />
                </AspectRatio>
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
