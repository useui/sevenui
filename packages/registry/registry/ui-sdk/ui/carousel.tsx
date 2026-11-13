"use client";

import * as React from "react";
import {
  CarouselContent as CarouselContentPrimitive,
  CarouselItem as CarouselItemPrimitive,
  CarouselNext as CarouselNextPrimitive,
  CarouselPrevious as CarouselPreviousPrimitive,
  Carousel as CarouselPrimitive,
  CarouselViewport as CarouselViewportPrimitive,
  createCarouselController,
  type CarouselController,
} from "@ui-sdk/react/carousel";
import { renderElement } from "@ui-sdk/react/primitive";
import { cn } from "cn";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/registry/ui-sdk/ui/button";

// The base flavour exposes embla's options and API. UI SDK pages with native
// scroll snap and a controller, so the options below map onto its props and
// CarouselApi is a shim over the controller that covers what the examples
// use. Snap indexes are 0-based like embla's; UI SDK pages are 1-based.
type CarouselOptions = {
  align?: "start" | "center" | "end";
  loop?: boolean;
  dragFree?: boolean;
  skipSnaps?: boolean;
  slidesToScroll?: number | "auto";
  startIndex?: number;
  watchDrag?: boolean;
  // Accepted and ignored: the base wrapper overrides axis with orientation,
  // UI SDK always keeps the end pages at the edges, and its scroll animation
  // has no duration.
  axis?: "x" | "y";
  containScroll?: false | "trimSnaps" | "keepSnaps";
  duration?: number;
};

type CarouselEvent = "select" | "reInit" | "settle";

type CarouselApiShim = {
  scrollTo: (index: number, jump?: boolean) => void;
  scrollPrev: (jump?: boolean) => void;
  scrollNext: (jump?: boolean) => void;
  canScrollPrev: () => boolean;
  canScrollNext: () => boolean;
  selectedScrollSnap: () => number;
  previousScrollSnap: () => number;
  scrollSnapList: () => number[];
  scrollProgress: () => number;
  on: (
    event: CarouselEvent,
    callback: (api: CarouselApiShim, event: CarouselEvent) => void,
  ) => CarouselApiShim;
  off: (
    event: CarouselEvent,
    callback: (api: CarouselApiShim, event: CarouselEvent) => void,
  ) => CarouselApiShim;
};

type CarouselApi = CarouselApiShim | undefined;

type CarouselProps = {
  opts?: CarouselOptions;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  api: CarouselApi;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  viewport: React.RefObject<HTMLDivElement | null>;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

type Listener = (api: CarouselApiShim, event: CarouselEvent) => void;

function createApi(
  controller: CarouselController,
  listeners: Map<CarouselEvent, Set<Listener>>,
  previous: { current: number },
): CarouselApiShim {
  const api: CarouselApiShim = {
    scrollTo: (index) => void controller.setPage(index + 1),
    scrollPrev: () => void controller.previous(),
    scrollNext: () => void controller.next(),
    canScrollPrev: () => controller.canPrevious(),
    canScrollNext: () => controller.canNext(),
    selectedScrollSnap: () => controller.getPage() - 1,
    previousScrollSnap: () => previous.current,
    // Embla lists each snap's scroll progress; UI SDK pages are evenly
    // reported here, which keeps the length (what callers read) exact.
    scrollSnapList: () => {
      const count = controller.getPageCount() ?? 0;
      return Array.from({ length: count }, (_, index) =>
        count > 1 ? index / (count - 1) : 0,
      );
    },
    scrollProgress: () => controller.getProgress(),
    on: (event, callback) => {
      let set = listeners.get(event);
      if (!set) {
        set = new Set();
        listeners.set(event, set);
      }
      set.add(callback);
      return api;
    },
    off: (event, callback) => {
      listeners.get(event)?.delete(callback);
      return api;
    },
  };
  return api;
}

// Reports a page count change after the first measure, which is when embla
// would re-initialise with new snaps.
function PageCountWatcher({
  count,
  onChange,
}: {
  count: number | null;
  onChange: (count: number | null) => void;
}) {
  React.useEffect(() => onChange(count), [count, onChange]);
  return null;
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [controller] = React.useState(createCarouselController);
  const listeners = React.useRef(new Map<CarouselEvent, Set<Listener>>());
  const previous = React.useRef(0);
  const viewport = React.useRef<HTMLDivElement | null>(null);
  const [api] = React.useState(() =>
    createApi(controller, listeners.current, previous),
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const knownCount = React.useRef<number | null>(null);

  const emit = React.useCallback(
    (event: CarouselEvent) => {
      for (const callback of listeners.current.get(event) ?? []) {
        callback(api, event);
      }
    },
    [api],
  );

  const refresh = React.useCallback(() => {
    setCanScrollPrev(controller.canPrevious());
    setCanScrollNext(controller.canNext());
  }, [controller]);

  const onCountChange = React.useCallback(
    (count: number | null) => {
      refresh();
      if (count === null) return;
      if (knownCount.current !== null && knownCount.current !== count) {
        emit("reInit");
      }
      knownCount.current = count;
    },
    [refresh, emit],
  );

  const scrollPrev = React.useCallback(() => {
    controller.previous();
  }, [controller]);

  const scrollNext = React.useCallback(() => {
    controller.next();
  }, [controller]);

  // UI SDK pages with the arrow keys inside the viewport; the base flavour
  // also pages from anywhere else in the region, like Previous and Next.
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (viewport.current?.contains(event.target as Node)) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  React.useEffect(() => {
    if (!setApi) return;
    setApi(api);
  }, [api, setApi]);

  return (
    <CarouselContext.Provider
      value={{
        api,
        opts,
        orientation,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        viewport,
      }}
    >
      <CarouselPrimitive
        controller={controller}
        orientation={orientation}
        align={opts?.align}
        loop={opts?.loop}
        dragFree={opts?.dragFree}
        skipSnaps={opts?.skipSnaps}
        slidesPerPage={opts?.slidesToScroll}
        defaultPage={
          opts?.startIndex === undefined ? undefined : opts.startIndex + 1
        }
        drag={opts?.watchDrag}
        onPageChange={() => {
          previous.current = controller.getPage() - 1;
          // The callback runs before the page changes; embla reports after.
          queueMicrotask(() => {
            refresh();
            emit("select");
          });
        }}
        onPageChangeComplete={() => emit("settle")}
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        // UI SDK requires the region to be named; base leaves that to the
        // caller, so an unnamed carousel is called "Carousel".
        aria-label={
          props["aria-label"] ?? (props["aria-labelledby"] ? undefined : "Carousel")
        }
        {...(props as Omit<
          React.ComponentProps<typeof CarouselPrimitive>,
          "className"
        >)}
      >
        {(state) => (
          <>
            <PageCountWatcher count={state.pageCount} onChange={onCountChange} />
            {children}
          </>
        )}
      </CarouselPrimitive>
    </CarouselContext.Provider>
  );
}

// Base renders an overflow-hidden wrapper with the content's slot around the
// flex row. Here the wrapper is UI SDK's scrolling viewport, so it keeps the
// slot, and the row carries no slot of its own.
function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation, viewport } = useCarousel();

  // Slides are spaced with padding, and the row pulls the first one back with
  // a negative margin (-ml-4 with pl-4). Embla translates the row, so that
  // works; a native scroller cannot scroll to the part of the row the margin
  // pushes out, and every page after the first would stop one padding short.
  // So the margin moves to the scroller itself, which is clipped back to the
  // carousel's edge.
  // biome-ignore lint/correctness/useExhaustiveDependencies: className can change the margin to move
  React.useLayoutEffect(() => {
    const scroller = viewport.current;
    const row = scroller?.firstElementChild as HTMLElement | null | undefined;
    if (!scroller || !row) return;
    const side = orientation === "horizontal" ? "marginInlineStart" : "marginTop";
    const sync = () => {
      row.style[side] = "";
      const margin = getComputedStyle(row)[side];
      row.style[side] = "0px";
      scroller.style[side] = margin;
      const pull = Math.max(0, -Number.parseFloat(margin) || 0);
      const rtl = getComputedStyle(scroller).direction === "rtl";
      scroller.style.clipPath =
        pull === 0
          ? ""
          : orientation === "horizontal"
            ? rtl
              ? `inset(0 ${pull}px 0 0)`
              : `inset(0 0 0 ${pull}px)`
            : `inset(${pull}px 0 0 0)`;
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [orientation, className, viewport]);

  return (
    <CarouselViewportPrimitive
      ref={viewport}
      className="overflow-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      render={(partProps, state) =>
        renderElement(
          "div",
          { ...partProps, "data-slot": "carousel-content" },
          undefined,
          state,
        )
      }
    >
      <CarouselContentPrimitive
        {...(props as React.ComponentProps<typeof CarouselContentPrimitive>)}
        render={(partProps, state) =>
          renderElement(
            "div",
            { ...partProps, "data-slot": undefined },
            undefined,
            state,
          )
        }
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className,
        )}
      />
    </CarouselViewportPrimitive>
  );
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel();

  return (
    <CarouselItemPrimitive
      {...(props as React.ComponentProps<typeof CarouselItemPrimitive>)}
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className,
      )}
    />
  );
}

// UI SDK keeps Previous and Next focusable at the ends, with aria-disabled,
// so focus never drops to the page; they dim as a disabled button does.
const stepDisabled = "aria-disabled:opacity-50";

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation } = useCarousel();

  return (
    <CarouselPreviousPrimitive
      render={(partProps) => (
        <Button
          {...partProps}
          data-slot="carousel-previous"
          variant={variant}
          size={size}
          className={cn(
            "absolute touch-manipulation rounded-full",
            stepDisabled,
            orientation === "horizontal"
              ? "inset-y-0 -left-12 my-auto"
              : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
            className,
          )}
          {...props}
        >
          <ChevronLeftIcon className="cn-rtl-flip" />
          <span className="sr-only">Previous slide</span>
        </Button>
      )}
    />
  );
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation } = useCarousel();

  return (
    <CarouselNextPrimitive
      render={(partProps) => (
        <Button
          {...partProps}
          data-slot="carousel-next"
          variant={variant}
          size={size}
          className={cn(
            "absolute touch-manipulation rounded-full",
            stepDisabled,
            orientation === "horizontal"
              ? "inset-y-0 -right-12 my-auto"
              : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
            className,
          )}
          {...props}
        >
          <ChevronRightIcon className="cn-rtl-flip" />
          <span className="sr-only">Next slide</span>
        </Button>
      )}
    />
  );
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
};
