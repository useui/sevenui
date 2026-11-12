import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
import { buttonVariants } from "@/registry/base/ui/button";
import { cn } from "cn";
import { byFlavour, isUiSdk } from "./helpers/flavour";
import { must } from "./helpers/must";

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
  clientWidth: Object.getOwnPropertyDescriptor(Element.prototype, "clientWidth"),
  scrollWidth: Object.getOwnPropertyDescriptor(Element.prototype, "scrollWidth"),
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
  // UI SDK measures the scrolling viewport (the carousel-content wrapper) by
  // its clientWidth and scrollWidth: three 400px slides in a 400px window.
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get() {
      return 400;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
    configurable: true,
    get(this: HTMLElement) {
      return this.getAttribute("data-slot") === "carousel-content" ? 1200 : 400;
    },
  });
});

afterAll(() => {
  for (const [name, descriptor] of Object.entries(originalDescriptors)) {
    if (descriptor) {
      Object.defineProperty(HTMLElement.prototype, name, descriptor);
    } else {
      delete (HTMLElement.prototype as unknown as Record<string, unknown>)[name];
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

// UI SDK measures the slides a tick after mount; embla measures during it.
async function measured(getApi: () => CarouselApi) {
  if (!isUiSdk) return;
  await waitFor(() => expect(getApi()?.scrollSnapList().length).toBe(3));
}

// Embla disables Previous and Next natively at the ends. UI SDK keeps them
// focusable with aria-disabled, so focus never drops to the page.
function isDisabled(button: HTMLElement) {
  return isUiSdk
    ? button.getAttribute("aria-disabled") === "true"
    : (button as HTMLButtonElement).disabled;
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

  it("exposes the embla api via setApi with a snap per slide", async () => {
    const { getApi } = renderCarousel();
    await measured(getApi);
    const api = getApi();
    expect(api).toBeDefined();
    expect(api?.scrollSnapList().length).toBe(3);
    expect(api?.selectedScrollSnap()).toBe(0);
  });

  it("starts with previous disabled and next enabled on the first slide", async () => {
    const { getApi } = renderCarousel();
    await measured(getApi);
    const previous = screen.getByRole("button", { name: "Previous slide" });
    const next = screen.getByRole("button", { name: "Next slide" });
    expect(isDisabled(previous)).toBe(true);
    expect(isDisabled(next)).toBe(false);
  });

  it("advances slides with next and disables it on the last slide", async () => {
    const user = userEvent.setup();
    const { getApi } = renderCarousel();
    await measured(getApi);
    const next = screen.getByRole("button", { name: "Next slide" });
    const previous = screen.getByRole("button", { name: "Previous slide" });

    await user.click(next);
    expect(getApi()?.selectedScrollSnap()).toBe(1);
    expect(isDisabled(previous)).toBe(false);

    await user.click(next);
    expect(getApi()?.selectedScrollSnap()).toBe(2);
    expect(isDisabled(next)).toBe(true);
  });

  it("scrolls back with the previous button", async () => {
    const user = userEvent.setup();
    const { getApi } = renderCarousel();
    await measured(getApi);
    await user.click(screen.getByRole("button", { name: "Next slide" }));
    expect(getApi()?.selectedScrollSnap()).toBe(1);
    await user.click(screen.getByRole("button", { name: "Previous slide" }));
    expect(getApi()?.selectedScrollSnap()).toBe(0);
  });

  it("scrolls with ArrowRight/ArrowLeft on the carousel region", async () => {
    const { getApi } = renderCarousel();
    await measured(getApi);
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

  it("renders the nav controls as outline icon buttons", () => {
    const { container } = renderCarousel();
    const expected = {
      "carousel-previous": "inset-y-0 -left-12 my-auto",
      "carousel-next": "inset-y-0 -right-12 my-auto",
    };
    for (const [slot, position] of Object.entries(expected)) {
      const button = must(container.querySelector(`[data-slot=${slot}]`));
      const want = cn(
        buttonVariants({
          variant: "outline",
          size: "icon-sm",
          className: `absolute touch-manipulation rounded-full ${byFlavour({
            base: "",
            // aria-disabled stands in for the native disabled state (above).
            "ui-sdk": "aria-disabled:opacity-50 ",
          })}${position}`,
        }),
      );
      expect(button.className.split(" ").sort()).toEqual(
        want.split(" ").sort(),
      );
    }
  });
});

// CarouselApi is embla's in the base flavour and a shim over the UI SDK
// controller in the other; examples drive both through these calls.
describe("CarouselApi", () => {
  it("pages with scrollTo, scrollNext and scrollPrev, and reports canScroll*", async () => {
    const { getApi } = renderCarousel();
    await measured(getApi);
    const api = must(getApi());
    expect(api.canScrollPrev()).toBe(false);
    expect(api.canScrollNext()).toBe(true);
    act(() => api.scrollTo(2));
    await waitFor(() => expect(api.selectedScrollSnap()).toBe(2));
    expect(api.canScrollNext()).toBe(false);
    act(() => api.scrollPrev());
    await waitFor(() => expect(api.selectedScrollSnap()).toBe(1));
    act(() => api.scrollNext());
    await waitFor(() => expect(api.selectedScrollSnap()).toBe(2));
  });

  it("calls select listeners with the new snap until they are removed", async () => {
    const { getApi } = renderCarousel();
    await measured(getApi);
    const api = must(getApi());
    const seen: number[] = [];
    const onSelect = (value: NonNullable<CarouselApi>) =>
      seen.push(value.selectedScrollSnap());
    api.on("select", onSelect);
    act(() => api.scrollTo(1));
    await waitFor(() => expect(seen).toEqual([1]));
    api.off("select", onSelect);
    act(() => api.scrollTo(2));
    await waitFor(() => expect(api.selectedScrollSnap()).toBe(2));
    expect(seen).toEqual([1]);
  });

  it("starts on opts.startIndex", async () => {
    const { getApi } = renderCarousel({ opts: { startIndex: 2 } });
    await measured(getApi);
    await waitFor(() => expect(getApi()?.selectedScrollSnap()).toBe(2));
  });
});
