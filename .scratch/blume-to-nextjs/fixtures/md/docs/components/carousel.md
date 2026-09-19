---
title: Carousel
description: A carousel with motion and swipe built using Embla.
---

```tsx
import { Card, CardContent } from "@/registry/base/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/registry/base/ui/carousel";

export default function CarouselDemo() {
  return (
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {Array.from({ length: 5 }, (_, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-4xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
```

## Installation

<InstallCommand item="carousel" />

## Usage

```tsx
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

<Carousel>
  <CarouselContent>
    <CarouselItem>...</CarouselItem>
    <CarouselItem>...</CarouselItem>
    <CarouselItem>...</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>;
```

## API reference

### Carousel

A thin wrapper over
[embla-carousel-react](https://www.embla-carousel.com/) (pinned to
`^8.6.0`). `ArrowLeft`/`ArrowRight` scroll the carousel when the region
has focus.

| Prop          | Type                                                       | Default        |
| ------------- | ---------------------------------------------------------- | -------------- |
| `opts`        | embla [`EmblaOptionsType`](https://www.embla-carousel.com/docs/api/options) (`loop`, `align`, `dragFree`, …) | — |
| `plugins`     | embla plugin array (none ship with SevenUI — e.g. `embla-carousel-autoplay`) | — |
| `orientation` | `"horizontal" \| "vertical"` — maps to embla's `axis`      | `"horizontal"` |
| `setApi`      | `(api: CarouselApi) => void` — for dots/counters via `api.on("select", …)`, `api.scrollTo(i)` | — |

### CarouselContent and CarouselItem

The track and slides. Slide width is a `basis-*` utility on
`CarouselItem` (`basis-1/3` shows three per view); spacing is `-ml-*` on
the content with a matching `pl-*` on items — embla reads margins, not
CSS `gap`. Vertical carousels need an explicit height on the content
(e.g. `className="h-[200px]"`), since embla measures the container.

### CarouselPrevious and CarouselNext

Nav buttons rendered through [Button](/docs/components/button); they
disable automatically at the ends when `loop` is off.
