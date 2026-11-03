"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/registry/base/ui/carousel";
import { LabSection } from "../lab-frame";

const SLIDES = [1, 2, 3, 4, 5];

function Slide({ n }: { n: number }) {
  return (
    <div className="bg-surface-panel flex aspect-square items-center justify-center rounded-lg border border-hairline text-2xl font-medium">
      {n}
    </div>
  );
}

export default function CarouselMatrix() {
  return (
    <div>
      <LabSection title="horizontal (first slide: previous disabled; tab to the nav buttons)">
        <div className="px-12">
          <Carousel className="w-40">
            <CarouselContent>
              {SLIDES.map((n) => (
                <CarouselItem key={n}>
                  <Slide n={n} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </LabSection>
      <LabSection title="vertical">
        <div className="py-12">
          <Carousel orientation="vertical" className="w-40">
            <CarouselContent className="h-40">
              {SLIDES.map((n) => (
                <CarouselItem key={n}>
                  <Slide n={n} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </LabSection>
    </div>
  );
}
