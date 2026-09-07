import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/registry/base/ui/carousel";

// Embla needs browser APIs jsdom lacks: matchMedia and IntersectionObserver.
window.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent: () => false,
})) as typeof window.matchMedia;

class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
window.IntersectionObserver ??=
  IntersectionObserverStub as unknown as typeof IntersectionObserver;

// Embla measures via offsetLeft/offsetWidth (NodeRects), which are all 0 in
// jsdom, collapsing every snap point into one. Seed a 400px viewport with each
// slide laid out at index * 400 so embla computes real snap points.
const originalDescriptors = {
  offsetWidth: Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "offsetWidth",
  ),
  offsetHeight: Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "offsetHeight",
  ),
  offsetLeft: Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "offsetLeft",
  ),
  offsetTop: Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "offsetTop",
  ),
};

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get() {
      return 400;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get() {
      return 100;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "offsetLeft", {
    configurable: true,
    get(this: HTMLElement) {
      if (this.getAttribute("data-slot") === "carousel-item") {
        const parent = this.parentElement;
        const index = parent ? Array.from(parent.children).indexOf(this) : 0;
        return index * 400;
      }
      return 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "offsetTop", {
    configurable: true,
    get() {
      return 0;
    },
  });
});

afterAll(() => {
  for (const [name, descriptor] of Object.entries(originalDescriptors)) {
    if (descriptor) {
      Object.defineProperty(HTMLElement.prototype, name, descriptor);
    }
  }
});

function renderCarousel(
  props: Partial<React.ComponentProps<typeof Carousel>> = {},
) {
  let api: CarouselApi;
  const view = render(
    <Carousel setApi={(value) => (api = value)} {...props}>
      <CarouselContent>
        {[1, 2, 3].map((slide) => (
          <CarouselItem key={slide}>Slide {slide}</CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>,
  );
  return { ...view, getApi: () => api };
}

describe("Carousel", () => {
  it("renders carousel/slide accessibility semantics", () => {
    renderCarousel();
    const region = screen.getByRole("region");
    expect(region.getAttribute("aria-roledescription")).toBe("carousel");
    expect(region.getAttribute("data-slot")).toBe("carousel");
    const slides = screen.getAllByRole("group");
    expect(slides.length).toBe(3);
    for (const slide of slides) {
      expect(slide.getAttribute("aria-roledescription")).toBe("slide");
    }
    expect(screen.getByText("Previous slide")).toBeDefined();
    expect(screen.getByText("Next slide")).toBeDefined();
  });

  it("exposes the embla api via setApi with a snap per slide", () => {
    const { getApi } = renderCarousel();
    const api = getApi();
    expect(api).toBeDefined();
    expect(api?.scrollSnapList().length).toBe(3);
    expect(api?.selectedScrollSnap()).toBe(0);
  });

  it("starts with previous disabled and next enabled on the first slide", () => {
    renderCarousel();
    const previous = screen.getByRole("button", { name: "Previous slide" });
    const next = screen.getByRole("button", { name: "Next slide" });
    expect((previous as HTMLButtonElement).disabled).toBe(true);
    expect((next as HTMLButtonElement).disabled).toBe(false);
  });

  it("advances slides with next and disables it on the last slide", async () => {
    const user = userEvent.setup();
    const { getApi } = renderCarousel();
    const next = screen.getByRole("button", { name: "Next slide" });
    const previous = screen.getByRole("button", { name: "Previous slide" });

    await user.click(next);
    expect(getApi()?.selectedScrollSnap()).toBe(1);
    expect((previous as HTMLButtonElement).disabled).toBe(false);

    await user.click(next);
    expect(getApi()?.selectedScrollSnap()).toBe(2);
    expect((next as HTMLButtonElement).disabled).toBe(true);
  });

  it("scrolls back with the previous button", async () => {
    const user = userEvent.setup();
    const { getApi } = renderCarousel();
    await user.click(screen.getByRole("button", { name: "Next slide" }));
    expect(getApi()?.selectedScrollSnap()).toBe(1);
    await user.click(screen.getByRole("button", { name: "Previous slide" }));
    expect(getApi()?.selectedScrollSnap()).toBe(0);
  });

  it("scrolls with ArrowRight/ArrowLeft on the carousel region", () => {
    const { getApi } = renderCarousel();
    const region = screen.getByRole("region");
    fireEvent.keyDown(region, { key: "ArrowRight" });
    expect(getApi()?.selectedScrollSnap()).toBe(1);
    fireEvent.keyDown(region, { key: "ArrowLeft" });
    expect(getApi()?.selectedScrollSnap()).toBe(0);
  });

  it("applies horizontal spacing classes by default", () => {
    const { container } = renderCarousel();
    const content = container.querySelector("[data-slot=carousel-content]");
    expect(content?.firstElementChild?.className).toContain("-ml-4");
    const item = container.querySelector("[data-slot=carousel-item]");
    expect(item?.className).toContain("pl-4");
    const previous = container.querySelector("[data-slot=carousel-previous]");
    expect(previous?.className).toContain("-left-12");
  });

  it("applies vertical layout classes with orientation='vertical'", () => {
    const { container } = renderCarousel({ orientation: "vertical" });
    const content = container.querySelector("[data-slot=carousel-content]");
    expect(content?.firstElementChild?.className).toContain("flex-col");
    expect(content?.firstElementChild?.className).toContain("-mt-4");
    const item = container.querySelector("[data-slot=carousel-item]");
    expect(item?.className).toContain("pt-4");
    const previous = container.querySelector("[data-slot=carousel-previous]");
    expect(previous?.className).toContain("rotate-90");
    expect(previous?.className).toContain("-top-12");
  });

  it("throws when carousel parts are used outside <Carousel />", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<CarouselContent />)).toThrowError(
      "useCarousel must be used within a <Carousel />",
    );
    errorSpy.mockRestore();
  });
});
