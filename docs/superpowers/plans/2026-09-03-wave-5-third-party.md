# Wave 5 Third-Party Wrapper Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Wave 5 third-party wrapper components (4 registry:ui items + demos + docs) deployable at sevenui.dev as v0.5.0 — calendar, carousel, chart, resizable — plus the `--chart-*` theme token set and two wave-4 leftovers (tabs-indicator example, smoke-test expansion). Registry grows from 50 to 54 components.

**Architecture:** Same proven loop as Waves 1–4: component source in `registry/base/ui/`, demo in `examples/<name>/`, docs page in `web/docs/components/`, entries in `registry.json`; `pnpm build:registry` emits `public/r/*.json`. These four components CANNOT be built on Base UI alone — the spec's "Where shadcn uses third-party libraries" table sanctions exactly four Radix-free libraries, one per component. All API facts below were verified against the INSTALLED packages on 2026-09-03 (`.d.ts` files and dist sources in `node_modules/` — do NOT "correct" them from memory or the web; three of the four installed majors are NEWER than the versions shadcn's own wrappers were written for, and the differences are load-bearing). `chart` is the wave's risk item: recharts v3 broke the v2 typings shadcn's chart.tsx used, so chart gets TDD (Vitest) plus a read-only pre-implementation verification gate (Task 8).

**Tech Stack:** Existing: `@base-ui/react` 1.7.0, Tailwind v4, class-variance-authority, Blume/shadcn-CLI pipeline, Vitest + Testing Library (`tests/`, from wave 4). NEW dependencies (Task 1): `react-day-picker@^10.0.1`, `embla-carousel-react@^8.6.0`, `recharts@^3.10.1`, `react-resizable-panels@^4.12.3`, `react-is@^19.0.0`.

**Spec:** `docs/superpowers/specs/2026-09-02-sevenui-registry-design.md`

## Global Constraints

- All repo content English; file names kebab-case; Conventional Commits, imperative mood; NO attribution trailers (no Co-Authored-By, no AI/model/tool names). See `AGENTS.md`.
- **Dependency allowlist (this wave's core boundary):** the base allowlist (`@base-ui/react`, Tailwind v4 classes, `class-variance-authority`, `clsx`, `tailwind-merge`) is unchanged. Wave 5 adds the spec's four sanctioned exceptions — each Radix-free and scoped to EXACTLY ONE component: `react-day-picker` → calendar only; `embla-carousel-react` → carousel only; `recharts` → chart only; `react-resizable-panels` → resizable only. No component may import a third-party lib other than its own. NO other third-party additions: no date-fns as a direct dependency (demos use fixed `new Date(y, m, d)` literals; if a date helper is ever needed, use `defaultDateLib` re-exported from `react-day-picker`), no embla plugins, no icon libraries (icons stay inline SVG).
- **Registry `dependencies` for the four libs are version-pinned with caret** (`"react-day-picker@^10.0.1"` etc.), unlike the bare `"@base-ui/react"` convention — these libs break APIs across majors (react-resizable-panels renamed every export in v4) and a consumer installing `latest` against our pinned-major source would get compile errors. Demo items that import a third-party lib directly (chart demos import `recharts`; calendar-range imports a type from `react-day-picker`) repeat the pinned dependency.
- **Installed-version landmines (verified 2026-09-03, per-library):**
  - react-day-picker **10.0.1**: v10 is the legacy alias of `@daypicker/react` with the v9-shaped API. classNames keys are the v9/v10 names (`month_grid`, `weekdays`, `weekday`, `week`, `day`, `day_button`, `button_previous`, `button_next`, `month_caption`, `dropdown_root` — NO v8 `table`/`head_row`/`cell`/`nav_button*` keys). Month range props are `startMonth`/`endMonth` (NOT `fromDate`/`toDate`). Day `<td>` carries presence data attributes `data-selected`/`data-today`/`data-outside`/`data-disabled`/`data-hidden`/`data-focused`; range states (`range_start`/`range_middle`/`range_end`) are CLASS-ONLY — no data attributes. Nav buttons receive `aria-disabled`, never native `disabled` — style with `aria-disabled:`. No `"use client"` in the package — our wrapper must carry it. Do not import `react-day-picker/style.css` — our classNames overrides replace it entirely.
  - embla-carousel-react **8.6.0**: `embla-carousel` is NOT resolvable top-level under pnpm (no hoist) — derive ALL types from `embla-carousel-react` (`UseEmblaCarouselType`, `Parameters<typeof useEmblaCarousel>`). `useEmblaCarousel(options?, plugins?)` returns `[callbackRef, api | undefined]` — always guard `api`. Event names are exactly `"select"` and `"reInit"`; listener signature `(api, eventName) => void`; `on` does not fire on registration — seed state manually once. DOM contract: the ref'd viewport element must have EXACTLY ONE child (the flex track); every direct child of the track is a slide; slides need `min-w-0 shrink-0 grow-0` (embla measures `offsetWidth` — default flex shrink collapses snap points).
  - recharts **3.10.1**: `TooltipProps` NO LONGER carries `payload`/`label`/`coordinate` — custom tooltip content types against the ROOT export `TooltipContentProps` (use `Partial<>`: its `payload`/`active`/`coordinate` are required). Custom legend content types against root export `DefaultLegendContentProps`; `LegendPayload.value` is `string | undefined` — guard it. Legend items are SORTED ALPHABETICALLY by default in v3 (`itemSorter` default `'value'`) — pass `itemSorter={null}` to keep data order. `accessibilityLayer` defaults to `true` — do not pass it in demos. Tooltip/Legend render via `createPortal` into `.recharts-wrapper` (inside our container — CSS vars still resolve). Fake payload entries (tests) must include the required `graphicalItemId: string`. No `"use client"` in the package — our wrapper carries it. `ResponsiveContainer` renders children ONLY when measured size is positive: SSR HTML contains just the wrapper + style tag, and jsdom needs a `getBoundingClientRect` mock (see Task 9).
  - react-resizable-panels **4.12.3**: v4 RENAMED EVERYTHING — exports are `Group`, `Panel`, `Separator` (`PanelGroup`/`PanelResizeHandle` do not exist and will not import). `Group` takes `orientation` (default `"horizontal"`), NOT `direction`. **Numbers now mean PIXELS** — percentage sizes must be strings (`defaultSize="50%"`, NOT `defaultSize={50}`). No `data-panel-group-direction` attribute exists — the wrapper emits its own `data-orientation`. The Separator's single styling hook is the VALUE-carrying `data-separator` attribute (`"inactive" | "hover" | "focus" | "active" | "disabled"`). Imperative handles are the `groupRef`/`panelRef`/`elementRef` PROPS (no forwardRef). `Panel`'s `className` lands on the INNER of its two rendered divs. Keyboard: arrows resize 5% (hardcoded), Home/End to extremes, Enter toggles collapse; hit area via Group's `resizeTargetMinimumSize` (defaults coarse 20/fine 10) — no hit-area CSS needed. `onCollapse`/`onExpand`/`onDragging`/`autoSaveId` are gone (persistence = `useDefaultLayout` hook).
- All four wrappers start with `"use client"`.
- Demos must not use `vh`/`svh` units (preview iframes auto-size — feedback loop); percentage widths assume the `[data-blume-example]` grid wrapper (`w-full` + `max-w-*` works). Fixed pixel heights (`h-[200px]`) are fine. Calendar demos use FIXED dates (`new Date(2026, 5, 12)`) so SSR output is deterministic and curl-assertable.
- Internal `registryDependencies` are full URLs `https://sevenui.dev/r/<name>.json`. Demo items use type `registry:component`, named `<component>-demo`, one per registry:ui item (check-registry enforces this); extra examples follow the `button-variants` precedent (own item name, own title/description).
- Docs pages live in `web/docs/components/*.mdx`, existing template (frontmatter `title`+`description`, `<Component path="<dir>/<file>" />`, `## Installation`, `## Usage` with consumer alias `@/components/ui/<name>`, `## API reference`). Wave 5 API reference sections link the WRAPPED LIBRARY's docs (daypicker.dev, embla-carousel.com, recharts.org, the react-resizable-panels GitHub) instead of base-ui.com, and MUST state the pinned major + the version-sensitive facts listed per task (consumers hit them immediately).
- `public/r/` is gitignored build output — never committed. Tests live in `tests/`, run with `pnpm test`.
- Theme parity: `scripts/check-registry.mjs` requires every token in the theme item's `cssVars` to appear as `--key: value;` (exact substring) in `examples/theme.css`. Root `theme.css` is NOT machine-checked — sync by hand (Task 7 touches all three files).
- Base UI state styling for the tabs-indicator ride-along: attribute PRESENCE (`data-[active]:`), `transition-[translate,width]` for the indicator (Tailwind v4 `translate-*` compiles to the standalone `translate:` property).

## Per-task verification loop (referenced as "standard verify" below)

```bash
pnpm typecheck && pnpm check:registry && pnpm test && pnpm build:registry
# Then: pnpm dev in background; curl the new /docs/blume-examples/<name>/<name>-demo route(s)
# (NOTE the /docs base path). Client-only content does NOT appear in SSR — curl proves the
# route renders and the static markup/classes exist; paste VERBATIM curl output in the task
# report. Stop the dev server cleanly (remove stale .blume/dev.lock if killed).
# REMEMBER: examples/theme.css changes do NOT hot-reload (restart blume dev), and
# `pnpm build` refuses to run while a dev server is running.
```

**Browser checks are BATCHED at the three explicit checkpoint tasks (4, 6, 10)** — per the wave 3/4 retrospectives, per-task browser checks are wasteful and checkpoint batches still catch plan-level defects. Blume demo islands are `client:visible`: they do NOT hydrate while the Chrome window is hidden — bring the window to the foreground (AppleScript activation) before interacting.

---

### Task 1: Third-party dependencies

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`

**Interfaces:**
- Produces: the four wrapper libraries + `react-is` installed and importable, consumed by Tasks 2, 3, 5, 9. Versions verified during planning: react-day-picker 10.0.1, embla-carousel-react 8.6.0, recharts 3.10.1, react-resizable-panels 4.12.3.

- [ ] **Step 1: Install**

```bash
pnpm add react-day-picker@^10.0.1 embla-carousel-react@^8.6.0 recharts@^3.10.1 react-resizable-panels@^4.12.3 react-is@^19.0.0
```

`react-is` is recharts' peer; without it pnpm satisfies the peer with a transitive 17.0.2 while our React is 19 — recharts' README requires react-is to match the installed React major. If `^19.0.0` fails to resolve, use the highest published 19.x.

- [ ] **Step 2: Verify imports compile**

Create a THROWAWAY probe file `__wave5_probe.tsx` at the repo root:

```tsx
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import useEmblaCarousel from "embla-carousel-react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { ResponsiveContainer, BarChart, Bar, Tooltip, Legend } from "recharts";
import type { TooltipContentProps, DefaultLegendContentProps } from "recharts";
export const probe = { DayPicker, getDefaultClassNames, useEmblaCarousel, Group, Panel, Separator, ResponsiveContainer, BarChart, Bar, Tooltip, Legend };
export type P = [DateRange, TooltipContentProps, DefaultLegendContentProps];
```

Run: `npx tsc --noEmit --ignoreConfig --jsx react-jsx --module esnext --moduleResolution bundler --target es2022 --skipLibCheck --strict ./__wave5_probe.tsx`
Expected: exit 0 (verified during planning). Then `rm __wave5_probe.tsx`.

- [ ] **Step 3: Verify the existing surface stays green and commit**

Run: `pnpm typecheck && pnpm check:registry && pnpm test`
Expected: all pass (dependency addition must not disturb anything).

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add wave 5 third-party dependencies"
```

---

### Task 2: Resizable

**Files:**
- Create: `registry/base/ui/resizable.tsx`, `examples/resizable/resizable-demo.tsx`, `web/docs/components/resizable.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`.
- Produces: `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle` from `@/registry/base/ui/resizable`. react-resizable-panels 4.12.3 facts (all from the installed `dist/react-resizable-panels.d.ts` + `.js`): exports `Group`/`Panel`/`Separator` (d.ts:26/214/395 — the v2 names are GONE); `Group` props `orientation?: "horizontal" | "vertical"` (default `"horizontal"`), `onLayoutChange(layout)` / `onLayoutChanged(layout, meta)` (Layout is an OBJECT keyed by panel id, not an array), `disabled`, `disableCursor`, `resizeTargetMinimumSize` (default `{coarse: 20, fine: 10}` — built-in hit area), `groupRef` (imperative handle as a PROP), `elementRef`; renders `<div data-group="true">` and spreads rest onto it (our `data-orientation` passes through); inline `display:flex`/`flexDirection`/`flexWrap`/`touchAction` are applied AFTER user style and cannot be overridden; `height:100%`/`width:100%`/`overflow:hidden` are overridable defaults — a demo that needs a fixed height must set it on a WRAPPER div (a `h-*` class on the Group loses to its inline `height:100%`). `Panel` props `defaultSize`/`minSize`/`maxSize`/`collapsedSize` accept `number | string` where NUMBER = PIXELS and unitless STRING = percent — always use strings like `"50%"`; `collapsible`, `onResize(panelSize, id, prevPanelSize)` with `PanelSize = {asPercentage, inPixels}` (no onCollapse/onExpand), `panelRef`; renders TWO divs — `className` lands on the INNER one. `Separator` props `disabled`, `disableDoubleClick` (double-click resets to default size), `children` (grip goes here); hardcodes `role="separator"` and `tabIndex={0}`; renders `data-separator` with the STATE as value (`inactive`/`hover`/`focus`/`active`/`disabled`) and `aria-orientation` INVERTED from the group's; inline `flexGrow:0 flexShrink:0 touchAction:none` non-overridable. Keyboard: arrows ±5% (hardcoded), Home/End, Enter collapse-toggle. Package ships `"use client"` itself and no CSS.

- [ ] **Step 1: Write registry/base/ui/resizable.tsx**

```tsx
"use client";

import * as React from "react";
import { Group, Panel, Separator } from "react-resizable-panels";

import { cn } from "@/registry/base/lib/utils";

function ResizablePanelGroup({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof Group>) {
  return (
    <Group
      data-orientation={orientation}
      orientation={orientation}
      className={cn("group/resizable", className)}
      {...props}
    />
  );
}

const ResizablePanel = Panel;

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & { withHandle?: boolean }) {
  return (
    <Separator
      className={cn(
        "relative flex w-px items-center justify-center bg-border outline-none data-[separator=active]:bg-ring data-[separator=focus]:ring-2 data-[separator=focus]:ring-ring/50 data-[separator=disabled]:opacity-50 group-data-[orientation=vertical]/resizable:h-px group-data-[orientation=vertical]/resizable:w-full",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 shrink-0 items-center justify-center rounded-xs border bg-border group-data-[orientation=vertical]/resizable:rotate-90">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-2.5"
          >
            <circle cx="9" cy="5" r="1" />
            <circle cx="9" cy="12" r="1" />
            <circle cx="9" cy="19" r="1" />
            <circle cx="15" cy="5" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="15" cy="19" r="1" />
          </svg>
        </div>
      )}
    </Separator>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
```

(No flex/size classes on the Group — v4 applies them inline. The `group/resizable` class + our `data-orientation` attribute exist because v4 emits NO direction attribute of its own; the handle's vertical variant keys off them.)

- [ ] **Step 2: Demo**

`examples/resizable/resizable-demo.tsx`: the Group's inline `height:100%` beats utility classes, so a wrapper div owns the size:

```tsx
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/registry/base/ui/resizable";

export default function ResizableDemo() {
  return (
    <div className="h-[200px] w-full max-w-md">
      <ResizablePanelGroup className="rounded-lg border">
        <ResizablePanel defaultSize="50%">
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">One</span>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="50%">
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel defaultSize="25%">
              <div className="flex h-full items-center justify-center p-6">
                <span className="font-semibold">Two</span>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize="75%">
              <div className="flex h-full items-center justify-center p-6">
                <span className="font-semibold">Three</span>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
```

(Match the default-export convention of existing demos — check `examples/button/button-demo.tsx` before writing. Sizes are STRINGS — `defaultSize="50%"`; `defaultSize={50}` would mean 50 PIXELS in v4.)

- [ ] **Step 3: Docs, registry items, standard verify, commit**

`resizable.mdx` links https://github.com/bvaughn/react-resizable-panels; API section documents: wraps react-resizable-panels **v4** (pinned `^4.12.3`), whose API differs from the v2 most tutorials cover — `orientation` not `direction`, sizes as percent STRINGS (`defaultSize="50%"`; bare numbers are pixels; `px`/`em`/`rem` units also accepted), imperative access via the `panelRef`/`groupRef` PROPS, handle styling via `data-separator="hover|focus|active|disabled"`, double-click a handle to reset, keyboard arrows resize by 5% / Enter toggles collapse, persistence via the library's `useDefaultLayout` hook (compose directly), and our wrapper's `data-orientation` attribute for direction-aware styling. Registry: resizable `registry:ui`, `dependencies: ["react-resizable-panels@^4.12.3"]`, regDeps utils URL; `resizable-demo` `registry:component` regDeps resizable URL. Standard verify (curl: panels and "One"/"Two"/"Three" spans ARE in SSR — no portals).

```bash
git add -A
git commit -m "feat(registry): add resizable component"
```

---

### Task 3: Carousel

**Files:**
- Create: `registry/base/ui/carousel.tsx`, `examples/carousel/carousel-demo.tsx`, `web/docs/components/carousel.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`; `Button` (check `registry/base/ui/button.tsx` — exports `Button`, `buttonVariants`; confirm `variant="outline"` and `size="icon"` exist in its cva before using); `Card`, `CardContent` (demo — check `registry/base/ui/card.tsx` export names).
- Produces: `Carousel` (props `opts`, `plugins`, `orientation`, `setApi`), `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`, `type CarouselApi`. embla-carousel-react 8.6.0 facts (installed `index.d.ts` + `components/useEmblaCarousel.d.ts` + esm source): `useEmblaCarousel(options?, plugins?)` returns `[EmblaViewportRefType, EmblaCarouselType | undefined]` — the ref is a STABLE CALLBACK ref (a useState setter) placed directly on the viewport div; the api is `undefined` until mounted — guard every use. Types come ONLY from `embla-carousel-react` (`embla-carousel` is not top-level resolvable under pnpm): `UseEmblaCarouselType[1]` is the api type, `Parameters<typeof useEmblaCarousel>[0]`/`[1]` the options/plugins types. Options are deep-compared each render (fresh object literals are safe; changes trigger `reInit`). Api methods used: `scrollPrev()`, `scrollNext()`, `canScrollPrev()`, `canScrollNext()`, `on(evt, cb)`, `off(evt, cb)` — event names exactly `"select"` and `"reInit"`, callback `(api, eventName) => void`, `on` does NOT fire at registration (seed state with one manual call), `off` removes by function identity. Option `axis: 'x' | 'y'` maps from our `orientation`. DOM contract (from the installed engine source): container = ref'd element's FIRST CHILD, slides = container's direct children measured via `offsetWidth` — hence outer `overflow-hidden` div carries the ref, inner `flex` div is the track, and every `CarouselItem` needs `min-w-0 shrink-0 grow-0 basis-full`; slide gaps via negative track margin + slide padding (embla reads margins, not CSS `gap`, for edge-gap detection). No keyboard events from embla — the wrapper implements ArrowLeft/ArrowRight itself.

- [ ] **Step 1: Write registry/base/ui/carousel.tsx**

```tsx
"use client";

import * as React from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";

import { cn } from "@/registry/base/lib/utils";
import { Button } from "@/registry/base/ui/button";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    { ...opts, axis: orientation === "horizontal" ? "x" : "y" },
    plugins,
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = React.useCallback(() => api?.scrollNext(), [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
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
    if (api && setApi) {
      setApi(api);
    }
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);
    return () => {
      api.off("reInit", onSelect);
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        orientation,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel();
  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel();
  return (
    <div
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className,
      )}
      {...props}
    />
  );
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
      </svg>
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
      <span className="sr-only">Next slide</span>
    </Button>
  );
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};
```

(If `Button`'s props type does not accept `disabled` styling gracefully, check how wave-1 `button.tsx` styles disabled state — it already handles it; do not restyle here.)

- [ ] **Step 2: Demo**

`examples/carousel/carousel-demo.tsx`: `Carousel className="w-full max-w-xs"` > `CarouselContent` > five `CarouselItem`s, each `<div className="p-1"><Card><CardContent className="flex aspect-square items-center justify-center p-6"><span className="text-4xl font-semibold">{index + 1}</span></CardContent></Card></div>` via `Array.from({ length: 5 }, (_, index) => ...)`; then `CarouselPrevious` + `CarouselNext`. No hooks → no `"use client"` needed (match existing demo conventions). Demo registryDependencies: carousel + card URLs.

- [ ] **Step 3: Docs, registry items, standard verify, commit**

`carousel.mdx` links https://www.embla-carousel.com/; API section documents: wraps embla-carousel-react (pinned `^8.6.0`); `opts` passes `EmblaOptionsType` (loop, align, dragFree...) and `plugins` embla plugins (none ship with SevenUI — install e.g. `embla-carousel-autoplay` separately); `orientation="vertical"` needs an explicit height on `CarouselContent`'s track (e.g. `className="h-[200px]"` — embla measures the container); `setApi` exposes the embla api (`api.on("select", ...)`, `api.scrollTo(i)`) for dots/counters; slide width = `basis-*` on `CarouselItem` (`basis-1/3` = three per view); spacing = `-ml-*` on content + `pl-*` on items (embla reads margins, not `gap`); ArrowLeft/ArrowRight work when the region is focused. Registry: carousel `registry:ui`, `dependencies: ["embla-carousel-react@^8.6.0"]`, regDeps utils + button URLs; `carousel-demo` regDeps carousel + card URLs. Standard verify (curl: all five slide numbers ARE in SSR — embla only transforms, never unmounts).

```bash
git add -A
git commit -m "feat(registry): add carousel component"
```

---

### Task 4: CHECKPOINT A — browser verification (resizable, carousel)

**Files:** none (fixes only if defects found).

- [ ] **Step 1:** `pnpm dev` in background; bring Chrome to the foreground (islands are `client:visible`).
- [ ] **Step 2: Resizable** — open `/docs/blume-examples/resizable/resizable-demo`: drag the vertical handle left/right → panels resize, `data-separator="active"` styling shows while dragging; drag the nested horizontal handle up/down; Tab to a handle → `data-separator="focus"` ring; ArrowLeft/ArrowRight resize by 5% steps; double-click a handle → resets to default sizes; verify the grip dots render and the nested handle's grip is rotated.
- [ ] **Step 3: Carousel** — open the carousel demo: Next/Previous buttons scroll one slide with animation; Previous is disabled on slide 1, Next disabled on slide 5; pointer-drag the slides; focus the region and press ArrowRight → advances. Inspect: viewport div has exactly one flex child, slides are its direct children (embla measured correctly — slides show one-per-view, not collapsed).
- [ ] **Step 4:** `read_console_messages` — no errors during any interaction.
- [ ] **Step 5:** Report findings; fix + amend the relevant component commit(s) if defects found, then re-verify. Stop the dev server.

---

### Task 5: Calendar

**Files:**
- Create: `registry/base/ui/calendar.tsx`, `examples/calendar/calendar-demo.tsx`, `examples/calendar/calendar-range.tsx`, `web/docs/components/calendar.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`, `buttonVariants` (exported by `registry/base/ui/button.tsx:49`).
- Produces: `Calendar` from `@/registry/base/ui/calendar` (all `DayPicker` props + our `buttonVariant`). react-day-picker 10.0.1 facts (installed `dist/esm/*.d.ts` + runtime): root exports `DayPicker`, `getDefaultClassNames` (returns the COMPLETE 43-key map of `rdp-*` names), types `DateRange` (`{ from: Date | undefined; to?: Date | undefined }`), `DayPickerProps` (a DISCRIMINATED UNION over `mode` — extend it with `& { buttonVariant?: ... }`, destructure our prop out before spreading). `mode?: "single" | "multiple" | "range"` (no default — undefined = non-interactive); `onSelect(selected, triggerDate, modifiers, e)`; `showOutsideDays` default falsy; `captionLayout: "label" | "dropdown" | "dropdown-months" | "dropdown-years"` (default `"label"`; `"dropdown"`/`"dropdown-years"` auto-range 100 years back when `startMonth` unset); `startMonth`/`endMonth`; `numberOfMonths` default 1. `classNames` is `Partial<ClassNames>` MERGED over defaults. The 26 UI keys: `root, chevron, day, day_button, caption_label, dropdowns, dropdown, dropdown_root, footer, month_grid, month_caption, months_dropdown, month, months, nav, button_next, button_previous, week, weeks, weekday, weekdays, week_number, week_number_header, years_dropdown` (+ flags `disabled/hidden/outside/focused/today`, selection states `range_start/range_middle/range_end/selected`, 8 animation keys). Day `<td>` data attributes (presence, value `"true"`): `data-selected`, `data-today`, `data-outside`, `data-disabled`, `data-hidden`, `data-focused`; range states are CLASS-ONLY. `components.Chevron` override receives `{ className?, style?, size?, disabled?, orientation?: "up"|"down"|"left"|"right" }` and NOTHING else. Nav buttons get `aria-disabled`, never `disabled`. DayButton (not overridden here) receives `disabled` normally. `buttonVariant` does not exist upstream (verified: zero grep hits). Package ships NO `"use client"` and nothing auto-imports its CSS.

- [ ] **Step 1: Write registry/base/ui/calendar.tsx**

```tsx
"use client";

import * as React from "react";
import type { VariantProps } from "class-variance-authority";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/registry/base/lib/utils";
import { buttonVariants } from "@/registry/base/ui/button";

function CalendarChevron({
  className,
  style,
  orientation = "left",
}: {
  className?: string;
  style?: React.CSSProperties;
  size?: number;
  disabled?: boolean;
  orientation?: "up" | "down" | "left" | "right";
}) {
  const paths = {
    up: "m18 15-6-6-6 6",
    down: "m6 9 6 6 6-6",
    left: "m15 18-6-6 6-6",
    right: "m9 18 6-6-6-6",
  } as const;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("size-4", className)}
      style={style}
    >
      <path d={paths[orientation]} />
    </svg>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  buttonVariant = "ghost",
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: VariantProps<typeof buttonVariants>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("bg-background p-3", className)}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months,
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-8 p-0 select-none aria-disabled:pointer-events-none aria-disabled:opacity-50",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-8 p-0 select-none aria-disabled:pointer-events-none aria-disabled:opacity-50",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "flex h-8 w-full items-center justify-center px-8",
          defaultClassNames.month_caption,
        ),
        caption_label: cn(
          "text-sm font-medium select-none",
          defaultClassNames.caption_label,
        ),
        dropdowns: cn(
          "flex h-8 w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          "relative rounded-md border border-input has-focus:ring-2 has-focus:ring-ring/50",
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn("absolute inset-0 opacity-0", defaultClassNames.dropdown),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "w-8 rounded-md text-[0.8rem] font-normal text-muted-foreground select-none",
          defaultClassNames.weekday,
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        day: cn(
          "group/day relative h-8 w-8 rounded-md p-0 text-center text-sm select-none",
          "data-[selected]:bg-primary data-[selected]:text-primary-foreground",
          "data-[today]:bg-accent data-[today]:text-accent-foreground data-[selected]:data-[today]:bg-primary data-[selected]:data-[today]:text-primary-foreground",
          "data-[outside]:text-muted-foreground data-[disabled]:text-muted-foreground data-[disabled]:opacity-50",
          "[&:not([data-selected],[data-disabled])]:hover:bg-accent",
          "focus-within:relative focus-within:z-20",
          defaultClassNames.day,
        ),
        day_button: cn(
          "flex size-8 items-center justify-center rounded-md font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none",
          defaultClassNames.day_button,
        ),
        range_start: cn("rounded-r-none", defaultClassNames.range_start),
        range_middle: cn(
          "rounded-none !bg-accent !text-foreground",
          defaultClassNames.range_middle,
        ),
        range_end: cn("rounded-l-none", defaultClassNames.range_end),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Chevron: CalendarChevron,
      }}
      {...props}
    />
  );
}

export { Calendar };
```

(Selected/today/outside/disabled styling hangs on the `<td>`'s presence data attributes — verified against the installed runtime. Range middle uses `!important` because `range_middle` and `data-selected` target the same element with conflicting backgrounds and CSS order between a class rule and a data-variant rule is not guaranteed. `defaultClassNames.*` is appended everywhere so unstyled keys keep their inert `rdp-*` names — we deliberately do NOT import `react-day-picker/style.css`.)

- [ ] **Step 2: Demos**

`examples/calendar/calendar-demo.tsx` (`"use client"` — has state):

```tsx
"use client";

import * as React from "react";

import { Calendar } from "@/registry/base/ui/calendar";

export default function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2026, 5, 12),
  );

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-lg border shadow-sm"
    />
  );
}
```

`examples/calendar/calendar-range.tsx` (`"use client"`): `const [range, setRange] = React.useState<DateRange | undefined>({ from: new Date(2026, 5, 8), to: new Date(2026, 5, 17) });` rendering `<Calendar mode="range" numberOfMonths={2} selected={range} onSelect={setRange} className="rounded-lg border shadow-sm" />` with `import type { DateRange } from "react-day-picker"`. Fixed June-2026 dates keep SSR deterministic. Demo registryDependencies: calendar URL for both; `calendar-range` also lists `dependencies: ["react-day-picker@^10.0.1"]` (it imports the type directly).

- [ ] **Step 3: Docs, registry items, standard verify, commit**

`calendar.mdx` links https://daypicker.dev; embed BOTH examples (`<Component path="calendar/calendar-demo" />` and a "### Range selection" section with `<Component path="calendar/calendar-range" />` — follow the exact multi-example layout of an existing two-example page like button's). API section documents: wraps react-day-picker **v10** (pinned `^10.0.1` — v10 is the legacy-name release of `@daypicker/react` with the v9-shaped API; v8 tutorials do not apply); `buttonVariant` styles the nav buttons with our button variants; month limits via `startMonth`/`endMonth` (v8's `fromDate`/`toDate` are gone); `captionLayout="dropdown"` adds month/year dropdowns and auto-ranges 100 years back unless `startMonth` is set; locales via `import { es } from "react-day-picker/locale"`; time zones via the `timeZone` prop and the re-exported `TZDate`; day states style via `data-selected`/`data-today`/`data-outside`/`data-disabled` on the day cell, range states via the `range_start`/`range_middle`/`range_end` classNames keys. Registry: calendar `registry:ui`, `dependencies: ["react-day-picker@^10.0.1"]`, regDeps utils + button URLs; `calendar-demo` and `calendar-range` items per convention (regDeps calendar URL). Standard verify (curl BOTH routes: June 2026 caption text and day numbers ARE in SSR — DayPicker renders synchronously; assert `data-selected` appears for the 12th in the demo).

```bash
git add -A
git commit -m "feat(registry): add calendar component"
```

---

### Task 6: CHECKPOINT B — browser verification (calendar)

**Files:** none (fixes only if defects found).

- [ ] **Step 1:** `pnpm dev` in background; Chrome foregrounded.
- [ ] **Step 2: Single mode** — open `/docs/blume-examples/calendar/calendar-demo`: June 2026 renders with the 12th selected (primary background); click another day → selection moves; chevron icons (our SVG override) render in both nav buttons; navigate months both directions; today's cell shows the accent style only in the month containing today; outside days are muted; keyboard: arrows move focus between days, Enter selects.
- [ ] **Step 3: Range mode** — open the calendar-range route: two months render side by side; 8–17 June show as a range (accent middle, primary rounded ends); click a new start then end → range restyles correctly across the boundary; verify range middle days do NOT show the primary background (the `!bg-accent` override works).
- [ ] **Step 4:** `read_console_messages` — no errors; specifically no React unknown-prop warning for `buttonVariant` (it must not reach the DOM).
- [ ] **Step 5:** Report findings; fix + amend if needed; stop the dev server.

---

### Task 7: Chart theme tokens (--chart-1..5)

**Files:**
- Modify: `registry.json` (theme item `cssVars`), `examples/theme.css`, `theme.css`

**Interfaces:**
- Produces: 5 chart tokens × 2 modes + `@theme inline` color mappings, consumed by Task 9's demos (`color: "var(--chart-1)"`). check-registry machine-verifies registry.json ↔ examples/theme.css parity; root `theme.css` is synced by hand. Values are shadcn's neutral-palette chart defaults — drop-in compatible with existing shadcn projects (same relationship as the wave-4 `--sidebar-*` set, which this task mirrors exactly).

- [ ] **Step 1: Add tokens to the theme item in registry.json**

In the `"theme"` item's `cssVars.light` (after `"ring"`, before `"sidebar"`):

```json
"chart-1": "oklch(0.646 0.222 41.116)",
"chart-2": "oklch(0.6 0.118 184.704)",
"chart-3": "oklch(0.398 0.07 227.392)",
"chart-4": "oklch(0.828 0.189 84.429)",
"chart-5": "oklch(0.769 0.188 70.08)"
```

And in `cssVars.dark` (after `"ring"`, before `"sidebar"`):

```json
"chart-1": "oklch(0.488 0.243 264.376)",
"chart-2": "oklch(0.696 0.17 162.48)",
"chart-3": "oklch(0.769 0.188 70.08)",
"chart-4": "oklch(0.627 0.265 303.9)",
"chart-5": "oklch(0.645 0.246 16.439)"
```

- [ ] **Step 2: Mirror into examples/theme.css**

Add the 5 light declarations (`--chart-1: oklch(0.646 0.222 41.116);` etc.) to the `:root` block after `--ring` (`examples/theme.css:20`) and the dark values to the `.dark, [data-theme="dark"]` block after its `--ring` (`examples/theme.css:52`) — EXACT `--key: value;` formatting (the parity check is a substring match). Add to the `@theme inline` block (after `--color-ring`, `examples/theme.css:96`):

```css
--color-chart-1: var(--chart-1);
--color-chart-2: var(--chart-2);
--color-chart-3: var(--chart-3);
--color-chart-4: var(--chart-4);
--color-chart-5: var(--chart-5);
```

REMEMBER: `examples/theme.css` does not hot-reload — restart `blume dev` before eyeballing anything.

- [ ] **Step 3: Mirror into root theme.css**

Same 5 light declarations in its `:root` (starts line 23), same 5 dark declarations in its `[data-theme="dark"]` block (starts line 60), same 5 `--color-chart-*` mappings in its `@theme inline` block (starts line 105). Read the file's structure first; chart tokens need no `--blume-*` bridge entries.

- [ ] **Step 4: Verify and commit**

Run: `pnpm check:registry` (theme parity must pass) and `pnpm build:registry`; confirm `public/r/theme.json` contains the chart tokens.

```bash
git add -A
git commit -m "feat(theme): add chart token set"
```

---

### Task 8: Chart groundwork — in-place recharts re-verification

Chart is the wave's risk item: the most from-scratch code, against the library whose current major broke the API the shadcn pattern was designed for. Before writing code, re-verify the load-bearing facts IN PLACE against the installed package (researched during planning; drift or misreading invalidates Task 9). Record each check's result in the task report.

**Files:** none created — read-only verification.

- [ ] **Step 1: Tooltip typing** — read `node_modules/recharts/types/component/Tooltip.d.ts` and `types/index.d.ts`. Confirm: `TooltipContentProps` is exported from the ROOT (`types/index.d.ts:10`) and carries `label?`, `payload` (required), `coordinate` (required), `active` (required), `accessibilityLayer` (required), `activeIndex` (`Tooltip.d.ts:11-19`); `TooltipProps` OMITS `payload`/`label`/`coordinate`/`viewBox`/`accessibilityLayer` and re-adds only `active?` (`Tooltip.d.ts:19-26`); the `content` union is `ReactElement | ((props: TooltipContentProps) => ReactNode)` (`Tooltip.d.ts:10`); `cursor` still exists with default `true` (`Tooltip.d.ts:77`, `:206`).
- [ ] **Step 2: Payload shape** — read `types/component/DefaultTooltipContent.d.ts`. Confirm the `Payload` interface fields `name`/`value`/`dataKey`/`color`/`fill`/`payload`/`unit` AND the REQUIRED `graphicalItemId: string` (line 31); `ValueType`/`NameType` live here (lines 8-9; `NameType` is NOT root-exported — rely on `TooltipContentProps` defaults instead of importing them).
- [ ] **Step 3: Legend** — read `types/component/Legend.d.ts`, `types/component/DefaultLegendContent.d.ts`, `es6/component/Legend.js:36-50`. Confirm: `DefaultLegendContentProps` root-exported; `LegendPayload` fields `value: string | undefined`, `dataKey`, `color`; custom content receives `payload` via props (cloneElement injection — no hook needed); `itemSorter` default `'value'` (alphabetical); `verticalAlign` still forwarded (deprecated in favor of `position` — fine to use).
- [ ] **Step 4: ResponsiveContainer render gate** — read `es6/component/ResponsiveContainer.js`. Confirm: children render ONLY inside `ResponsiveContainerContextProvider`, which returns `null` unless width AND height are positive (`isAcceptableSize`); the mount effect unconditionally reads `getBoundingClientRect()` and calls `setContainerSize` — so in jsdom (0×0 rects) children unmount after mount UNLESS `getBoundingClientRect` is mocked. This is the basis of Task 9's test harness and the reason SSR curl output contains only the wrapper + `<style>`.
- [ ] **Step 5: Defaults that changed in v3** — confirm `accessibilityLayer` default `true` (`types/util/types.d.ts:1236-1240`), Bar `radius?: number | [number, number, number, number]` (`types/cartesian/Bar.d.ts:175`), Line `type` accepts `"natural"` and `dot?: boolean` (`types/cartesian/Line.d.ts:201`, `:120`), `CartesianGrid` `vertical={false}` valid (`types/cartesian/CartesianGrid.d.ts:71`), XAxis `tickLine`/`axisLine`/`tickMargin`/`tickFormatter` (`types/cartesian/XAxis.d.ts` + `types/util/types.d.ts:776-793`).
- [ ] **Step 6:** Report PASS/FAIL per check with file:line evidence. On any FAIL, STOP and revise Task 9 before executing it.

---

### Task 9: Chart (TDD)

**Files:**
- Create: `registry/base/ui/chart.tsx`, `tests/chart.test.tsx`, `examples/chart/chart-demo.tsx`, `examples/chart/chart-line.tsx`, `web/docs/components/chart.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`; chart tokens from Task 7; test infra from wave 4 (`tests/setup.ts` already stubs ResizeObserver with a no-op — that is exactly why the size never updates after the mock below seeds it).
- Produces: `ChartContainer` (props `config: ChartConfig`, `id?`, div props), `ChartTooltip` (= recharts `Tooltip`), `ChartTooltipContent` (props `hideLabel?`, `hideIndicator?`, `indicator?: "line" | "dot" | "dashed"`, `nameKey?`, `labelKey?` + `Partial<TooltipContentProps>`), `ChartLegend` (= recharts `Legend`), `ChartLegendContent` (props `hideIcon?`, `nameKey?` + `payload`/`verticalAlign`), `ChartStyle`, `type ChartConfig`. Theme scoping: light vars under `[data-chart=ID]`, dark vars under BOTH `.dark [data-chart=ID]` (consumer shadcn convention) and `[data-theme="dark"] [data-chart=ID]` (our docs site + Blume preview convention) — this dual selector is the one deliberate divergence from shadcn's chart.

- [ ] **Step 1: Write the failing tests (tests/chart.test.tsx)**

```tsx
import { render, screen } from "@testing-library/react";
import { Bar, BarChart } from "recharts";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  ChartContainer,
  ChartLegendContent,
  ChartStyle,
  ChartTooltipContent,
  type ChartConfig,
} from "@/registry/base/ui/chart";

// ResponsiveContainer unmounts children unless it measures a positive size;
// jsdom rects are 0x0, so seed a fixed measurement. The ResizeObserver stub in
// tests/setup.ts never fires, so the seeded size sticks for the whole test.
beforeAll(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    width: 400,
    height: 225,
    top: 0,
    left: 0,
    right: 400,
    bottom: 225,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);
});

afterAll(() => {
  vi.restoreAllMocks();
});

const config = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: {
    label: "Mobile",
    theme: {
      light: "oklch(0.6 0.118 184.704)",
      dark: "oklch(0.696 0.17 162.48)",
    },
  },
} satisfies ChartConfig;

describe("ChartStyle", () => {
  it("emits per-series color variables scoped to the chart id", () => {
    const { container } = render(<ChartStyle id="chart-test" config={config} />);
    const css = container.querySelector("style")?.innerHTML ?? "";
    expect(css).toContain("[data-chart=chart-test]");
    expect(css).toContain("--color-desktop: var(--chart-1);");
    expect(css).toContain("--color-mobile: oklch(0.6 0.118 184.704);");
  });

  it("emits dark values under both dark-mode selectors", () => {
    const { container } = render(<ChartStyle id="chart-test" config={config} />);
    const css = container.querySelector("style")?.innerHTML ?? "";
    expect(css).toContain(".dark [data-chart=chart-test]");
    expect(css).toContain('[data-theme="dark"] [data-chart=chart-test]');
    expect(css).toContain("--color-mobile: oklch(0.696 0.17 162.48);");
  });
});

describe("ChartContainer", () => {
  it("renders a data-chart scope containing the style tag and the chart", () => {
    const { container } = render(
      <ChartContainer config={config}>
        <BarChart data={[{ month: "Jan", desktop: 1 }]}>
          <Bar dataKey="desktop" />
        </BarChart>
      </ChartContainer>,
    );
    const scope = container.querySelector("[data-chart]");
    expect(scope).not.toBeNull();
    expect(scope?.querySelector("style")).not.toBeNull();
    expect(scope?.querySelector(".recharts-responsive-container")).not.toBeNull();
  });
});

describe("ChartTooltipContent", () => {
  const payload = [
    {
      dataKey: "desktop",
      name: "desktop",
      value: 186,
      color: "var(--color-desktop)",
      payload: { month: "January", desktop: 186 },
      graphicalItemId: "bar-desktop",
    },
  ];

  it("renders config labels and values when active", () => {
    render(
      <ChartContainer config={config}>
        <ChartTooltipContent
          active
          payload={payload}
          label="desktop"
          coordinate={{ x: 0, y: 0 }}
          accessibilityLayer
          activeIndex={undefined}
        />
      </ChartContainer>,
    );
    expect(screen.getAllByText("Desktop").length).toBeGreaterThan(0);
    expect(screen.getByText("186")).toBeDefined();
  });

  it("renders nothing when inactive", () => {
    render(
      <ChartContainer config={config}>
        <ChartTooltipContent
          active={false}
          payload={payload}
          coordinate={{ x: 0, y: 0 }}
          accessibilityLayer
          activeIndex={undefined}
        />
      </ChartContainer>,
    );
    expect(screen.queryByText("186")).toBeNull();
  });
});

describe("ChartLegendContent", () => {
  it("renders config labels for legend payload entries", () => {
    render(
      <ChartContainer config={config}>
        <ChartLegendContent
          payload={[
            { value: "desktop", dataKey: "desktop", color: "#111" },
            { value: "mobile", dataKey: "mobile", color: "#222" },
          ]}
        />
      </ChartContainer>,
    );
    expect(screen.getByText("Desktop")).toBeDefined();
    expect(screen.getByText("Mobile")).toBeDefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test`
Expected: `tests/chart.test.tsx` FAILS with "Cannot find module '@/registry/base/ui/chart'" (or equivalent). The wave-4 suites must still pass.

- [ ] **Step 3: Write registry/base/ui/chart.tsx**

```tsx
"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import type {
  DefaultLegendContentProps,
  TooltipContentProps,
} from "recharts";

import { cn } from "@/registry/base/lib/utils";

// Dark vars ship under BOTH selectors: `.dark` for consumer shadcn projects,
// `[data-theme="dark"]` for this docs site and the Blume previews.
const THEME_SELECTORS = {
  light: (id: string) => `[data-chart=${id}]`,
  dark: (id: string) =>
    `.dark [data-chart=${id}], [data-theme="dark"] [data-chart=${id}]`,
} as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<"light" | "dark", string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center overflow-hidden text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-layer]:outline-none [&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(
    ([, itemConfig]) => itemConfig.theme || itemConfig.color,
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: (
          Object.keys(THEME_SELECTORS) as Array<keyof typeof THEME_SELECTORS>
        )
          .map((theme) => {
            const lines = colorConfig
              .map(([key, itemConfig]) => {
                const color = itemConfig.theme?.[theme] ?? itemConfig.color;
                return color ? `--color-${key}: ${color};` : null;
              })
              .filter(Boolean)
              .join("\n");
            return `${THEME_SELECTORS[theme](id)} {\n${lines}\n}`;
          })
          .join("\n"),
      }}
    />
  );
}

const ChartTooltip = RechartsPrimitive.Tooltip;

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }
  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;
  if (
    key in payload &&
    typeof (payload as Record<string, unknown>)[key] === "string"
  ) {
    configLabelKey = (payload as Record<string, string>)[key];
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof (payloadPayload as Record<string, unknown>)[key] === "string"
  ) {
    configLabelKey = (payloadPayload as Record<string, string>)[key];
  }

  return configLabelKey in config ? config[configLabelKey] : config[key];
}

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<"div"> &
  Partial<TooltipContentProps> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    nameKey?: string;
    labelKey?: string;
  }) {
  const { config } = useChart();

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }

    const [item] = payload;
    const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !labelKey && typeof label === "string"
        ? (config[label as keyof typeof config]?.label ?? label)
        : itemConfig?.label;

    if (labelFormatter && value !== undefined) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      );
    }
    if (!value) {
      return null;
    }
    return <div className={cn("font-medium", labelClassName)}>{value}</div>;
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ]);

  if (!active || !payload?.length) {
    return null;
  }

  const nestLabel = payload.length === 1 && indicator !== "dot";

  return (
    <div
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className,
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = color || item.payload?.fill || item.color;

          return (
            <div
              key={String(item.dataKey ?? index)}
              className={cn(
                "flex w-full flex-wrap items-stretch gap-2 [&>svg]:size-2.5 [&>svg]:text-muted-foreground",
                indicator === "dot" && "items-center",
              )}
            >
              {formatter && item.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, payload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn("shrink-0 rounded-[2px]", {
                          "size-2.5": indicator === "dot",
                          "w-1": indicator === "line",
                          "w-0 border-[1.5px] border-dashed bg-transparent":
                            indicator === "dashed",
                          "my-0.5": nestLabel && indicator === "dashed",
                        })}
                        style={{
                          backgroundColor:
                            indicator === "dashed" ? undefined : indicatorColor,
                          borderColor: indicatorColor,
                        }}
                      />
                    )
                  )}
                  <div
                    className={cn(
                      "flex flex-1 shrink-0 justify-between leading-none",
                      nestLabel ? "items-end" : "items-center",
                    )}
                  >
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-foreground">
                        {itemConfig?.label || item.name}
                      </span>
                    </div>
                    {item.value !== undefined && item.value !== null && (
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {typeof item.value === "number"
                          ? item.value.toLocaleString()
                          : item.value}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend;

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: React.ComponentProps<"div"> &
  Pick<DefaultLegendContentProps, "payload" | "verticalAlign"> & {
    hideIcon?: boolean;
    nameKey?: string;
  }) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className,
      )}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div
            key={item.value ?? String(item.dataKey)}
            className="flex items-center gap-1.5 [&>svg]:size-3 [&>svg]:text-muted-foreground"
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="size-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
            )}
            {itemConfig?.label ?? item.value}
          </div>
        );
      })}
    </div>
  );
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
```

(The `[&_.recharts-*]` selectors in ChartContainer are best-effort cosmetic overrides carried from the shadcn pattern; if v3 renamed any internal class they become inert no-ops — Checkpoint C eyeballs axis/grid colors and adjusts if needed.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test`
Expected: all chart tests PASS; wave-4 suites still pass.

- [ ] **Step 5: Demos**

`examples/chart/chart-demo.tsx` (no hooks — no directive):

```tsx
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/registry/base/ui/chart";

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig;

export default function ChartDemo() {
  return (
    <ChartContainer config={chartConfig} className="w-full max-w-md">
      <BarChart data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value: string) => value.slice(0, 3)}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
```

`examples/chart/chart-line.tsx`: same `chartData`/`chartConfig`; `LineChart` with `CartesianGrid vertical={false}`, same `XAxis`, `ChartTooltip content={<ChartTooltipContent hideLabel />}`, and two `<Line dataKey="..." type="natural" stroke="var(--color-...)" strokeWidth={2} dot={false} />`. Do NOT pass `accessibilityLayer` anywhere (default true in v3).

- [ ] **Step 6: Docs, registry items, standard verify, commit**

`chart.mdx` links https://recharts.org; embed both examples (default + "### Line chart" section). API section documents: wraps recharts **v3** (pinned `^3.10.1` — v2 snippets need porting); charts compose from recharts primitives inside `ChartContainer` — we wrap the container/tooltip/legend, not every chart type; `ChartConfig` maps series keys to `label`/`icon` and `color` OR per-theme `theme.light`/`theme.dark`; series colors resolve as `var(--color-<key>)` scoped to the container (dark values apply under both `.dark` and `[data-theme="dark"]`); v3 gotchas consumers will hit: custom tooltip content types against root-exported `TooltipContentProps` (NOT `ComponentProps<typeof Tooltip>`), legend items sort alphabetically unless `itemSorter={null}`, `accessibilityLayer` is on by default. Registry: chart `registry:ui`, `dependencies: ["recharts@^3.10.1"]`, regDeps utils URL; `chart-demo` and `chart-line` items with `dependencies: ["recharts@^3.10.1"]` (they import recharts directly), regDeps chart URL. Standard verify (curl BOTH routes: SSR contains the `data-chart` wrapper and the `<style>` with `--color-desktop` — the SVG chart is client-only, per Task 8 Step 4; assert exactly that).

```bash
git add -A
git commit -m "feat(registry): add chart component"
```

---

### Task 10: CHECKPOINT C — browser verification (chart)

**Files:** none (fixes only if defects found).

- [ ] **Step 1:** `pnpm dev` in background; Chrome foregrounded (restart dev server if it was running before Task 7's `examples/theme.css` change — that file does not hot-reload).
- [ ] **Step 2: Bar chart** — open `/docs/blume-examples/chart/chart-demo`: bars render in two distinguishable chart-token colors at 16:9 aspect; hover a month → tooltip shows "Desktop"/"Mobile" labels, color swatches, and formatted values; legend shows both series with swatches; axis labels are 3-letter months in muted foreground.
- [ ] **Step 3: Dark mode** — toggle Blume's theme switch: bar colors change to the dark chart tokens (the `[data-theme="dark"]` selector branch — this is the load-bearing divergence from shadcn, verify it explicitly); tooltip/legend remain readable.
- [ ] **Step 4: Line chart** — open the chart-line route: two smooth (natural-curve) lines, no dots, tooltip without label header (hideLabel).
- [ ] **Step 5:** `read_console_messages` — no errors, no React key warnings from tooltip/legend maps. If grid/axis colors look wrong (inert `.recharts-*` selectors), fix ChartContainer's selector list to match the actual v3 DOM class names observed in the inspector, re-run `pnpm test`, and amend.
- [ ] **Step 6:** Report findings; fix + amend if needed; stop the dev server.

---

### Task 11: Tabs indicator example (wave-4 leftover)

**Files:**
- Create: `examples/tabs/tabs-indicator.tsx`
- Modify: `registry.json`, `web/docs/components/tabs.mdx`

**Interfaces:**
- Consumes: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` from `@/registry/base/ui/tabs`; `Tabs as TabsPrimitive` from `@base-ui/react/tabs` (the raw Indicator part).
- Produces: the `tabs-indicator` registry:component item deferred from wave 4. Base UI 1.7 facts (bundled docs `node_modules/@base-ui/react/docs/react/components/tabs.md`): `Tabs.Indicator` renders a `<span>` inside `Tabs.List`, THROWS outside it (error 65), and exposes `--active-tab-left`/`--active-tab-width` (plus `-right`/`-bottom`/`-height`) CSS vars; the bundled recipe animates `translate-x-(--active-tab-width... )` — verify the exact class recipe at `tabs.md:44` before writing and mirror it with our tokens.

- [ ] **Step 1: Write examples/tabs/tabs-indicator.tsx**

Re-read `node_modules/@base-ui/react/docs/react/components/tabs.md:44` and `registry/base/ui/tabs.tsx` first (TabsTrigger already styles `data-[active]:bg-background data-[active]:shadow-sm` — the triggers in THIS example must suppress that so the indicator is the only moving pill):

```tsx
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

const tabClassName =
  "data-[active]:bg-transparent data-[active]:shadow-none";

export default function TabsIndicatorDemo() {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-sm">
      <TabsList className="relative w-full">
        <TabsPrimitive.Indicator className="absolute top-1/2 left-0 z-[-1] h-[calc(100%-6px)] w-(--active-tab-width) translate-x-(--active-tab-left) -translate-y-1/2 rounded-md bg-background shadow-sm transition-[translate,width] duration-200 ease-in-out" />
        <TabsTrigger value="overview" className={tabClassName}>
          Overview
        </TabsTrigger>
        <TabsTrigger value="reports" className={tabClassName}>
          Reports
        </TabsTrigger>
        <TabsTrigger value="settings" className={tabClassName}>
          Settings
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-sm text-muted-foreground">
          The indicator slides between tabs using the --active-tab-* variables.
        </p>
      </TabsContent>
      <TabsContent value="reports">
        <p className="text-sm text-muted-foreground">Reports content.</p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="text-sm text-muted-foreground">Settings content.</p>
      </TabsContent>
    </Tabs>
  );
}
```

(`translate-x-(--active-tab-left)` + `transition-[translate,width]` — Tailwind v4 `translate-*` compiles to the standalone `translate` property; `transition-[transform,width]` would not animate it. If the combined `-translate-y-1/2` + `translate-x-(...)` utilities conflict in the generated CSS, follow the bundled demo exactly: `top-0 h-full` without the y-centering.)

- [ ] **Step 2: Register + docs**

registry.json: `tabs-indicator` `registry:component`, title "Tabs Indicator", description "Tabs with an animated active-tab indicator.", regDeps tabs URL, file `examples/tabs/tabs-indicator.tsx`. `tabs.mdx`: add a "### With animated indicator" section embedding `<Component path="tabs/tabs-indicator" />` after the default example, with one sentence pointing at `Tabs.Indicator` and the `--active-tab-*` vars (the wave-4 "compose directly" escape hatch, now shown live).

- [ ] **Step 3: Standard verify, browser-spot-check, commit**

Standard verify (curl `/docs/blume-examples/tabs/tabs-indicator`). This small task carries its own browser check (no separate checkpoint): open the route, click through the three tabs — the pill SLIDES between triggers (no jump-cut), width adapts per trigger, panels switch.

```bash
git add -A
git commit -m "feat(registry): add tabs indicator example"
```

---

### Task 12: Smoke-test expansion (wave-4 leftover)

**Files:**
- Modify: `scripts/smoke-test.sh`

**Interfaces:**
- Consumes: the built local registry (`public/r/*.json`) incl. wave-5 items; the existing script structure (localhost registry rewrite, scratch Vite-less consumer, pinned repo `shadcn` binary).
- Produces: CI-level proof of the two install paths wave 5 introduces: a MULTI-FILE item with hooks alias + 7 transitive regDeps (sidebar) and items with third-party npm `dependencies` (calendar, chart). The spec's "install smoke test (representative components)" pipeline item — until now theme+button only.

- [ ] **Step 1: Extend the install list**

In `scripts/smoke-test.sh`, extend the `shadcn add` invocation (currently theme + button, around line 106):

```bash
(cd "$APP" && "$SHADCN_BIN" add --yes --overwrite \
  "http://localhost:$PORT/theme.json" \
  "http://localhost:$PORT/button.json" \
  "http://localhost:$PORT/sidebar.json" \
  "http://localhost:$PORT/calendar.json" \
  "http://localhost:$PORT/chart.json")
```

- [ ] **Step 2: Assert the wave-5 install contracts**

After the `add` and before the tsc step, insert:

```bash
# Wave 5 contracts: multi-file item lands the hook under the hooks alias,
# third-party deps land in the consumer package.json.
test -f "$APP/src/hooks/use-mobile.ts" || { echo "use-mobile.ts missing" >&2; exit 1; }
grep -q '"react-day-picker"' "$APP/package.json" || { echo "react-day-picker not installed" >&2; exit 1; }
grep -q '"recharts"' "$APP/package.json" || { echo "recharts not installed" >&2; exit 1; }
```

- [ ] **Step 3: Extend the consumer usage file**

Replace the `main.tsx` heredoc so the installed code is actually exercised (check the installed `$APP/src/components/ui/sidebar.tsx` export names first — `SidebarProvider` is expected from wave 4):

```tsx
import { Bar, BarChart } from "recharts";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { SidebarProvider } from "@/components/ui/sidebar";

const config = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function App() {
  return (
    <SidebarProvider>
      <Button variant="outline">ok</Button>
      <Calendar mode="single" />
      <ChartContainer config={config}>
        <BarChart data={[{ month: "Jan", desktop: 1 }]}>
          <Bar dataKey="desktop" />
        </BarChart>
      </ChartContainer>
    </SidebarProvider>
  );
}
```

- [ ] **Step 4: Run and commit**

Run: `pnpm build:registry && pnpm test:smoke`
Expected: "Smoke test passed." (npm install in the scratch app now takes noticeably longer — recharts pulls its redux dependency tree; that is expected).

```bash
git add scripts/smoke-test.sh
git commit -m "test: extend smoke test to sidebar, calendar, and chart"
```

---

### Task 13: Docs navigation, changelog, release prep

**Files:**
- Modify: `blume.config.ts`, `CHANGELOG.md`, `web/docs/index.mdx`, `AGENTS.md`

**Interfaces:**
- Consumes: all four Wave 5 component pages.

- [ ] **Step 1: Update navigation**

In `blume.config.ts`, insert the 4 new routes into the alphabetical Components sidebar list (entries are plain strings): `"/components/calendar"` between button and card; `"/components/carousel"` and `"/components/chart"` between card and checkbox (order: card, carousel, chart, checkbox); `"/components/resizable"` between radio-group and scroll-area. Final list = **54** alphabetical entries.

- [ ] **Step 2: Update CHANGELOG.md**

Prepend above the v0.4.0 entry:

```markdown
## v0.5.0 — Third-party wrapper wave

4 new components: calendar, carousel, chart, resizable — the components
that cannot be built on Base UI alone. Each wraps the same Radix-free
library shadcn uses, pinned to the installed major: react-day-picker 10
(calendar), embla-carousel-react 8 (carousel), recharts 3 (chart, with
Vitest tests and dual dark-mode CSS-var scoping), react-resizable-panels
4 (resizable, the renamed Group/Panel/Separator API). Adds the --chart-*
token set to the theme, a tabs indicator example, and extends the
install smoke test to sidebar, calendar, and chart.
```

- [ ] **Step 3: Update web/docs/index.mdx**

Both count sentences 50 → 54 (lines 6 and 22) and "across four waves" → "across five waves"; add the wave bullet after the navigation & composite bullet:

```markdown
- **Third-party wrapper wave** (4): calendar, carousel, chart, resizable.
```

Rework the closing "zero third-party UI libraries" paragraph (lines 35-38) so the claim stays true: every Base UI-buildable component uses Base UI and nothing else (still no Radix, no cmdk, no vaul, no sonner); the third-party wave adds exactly four specialized, Radix-free libraries — react-day-picker, embla-carousel, recharts, react-resizable-panels — the same sanctioned choices shadcn makes, and the only non-Base-UI dependencies in the registry.

- [ ] **Step 4: Refresh AGENTS.md**

Update the "Completed plans" line (waves 1–4 merged → waves 1–5, adding this plan's path `docs/superpowers/plans/2026-09-03-wave-5-third-party.md`; flip to "merged" wording as part of the release commit if executing after merge). In the Project paragraph, extend the "never Radix or react-aria" sentence with the boundary: four sanctioned Radix-free wrapper dependencies exist (react-day-picker, embla-carousel-react, recharts, react-resizable-panels), each scoped to exactly one component per the spec.

- [ ] **Step 5: Full verify and commit**

```bash
pnpm typecheck && pnpm check:registry && pnpm test && pnpm build && pnpm test:smoke
# click through the new /docs/components/* pages via pnpm preview; confirm 54 sidebar links
git add -A
git commit -m "docs: add wave 5 navigation and changelog"
```

---

### Task 14: Deploy verification and v0.5.0 (post-merge)

**Files:** none in-repo.

- [ ] **Step 1:** After merge to main, push; Vercel auto-deploys. CI must be green including `pnpm test` (now with the chart suite) and the extended smoke test.
- [ ] **Step 2:** Live checks: `curl -s https://sevenui.dev/r/calendar.json | head -c 400` (dependencies must contain `react-day-picker@^10.0.1`), same for `carousel.json`/`chart.json`/`resizable.json` (their pinned deps), and `theme.json` (contains `--chart-1`). Scratch consumer app: `shadcn add` calendar + chart + resizable + carousel from the LIVE URLs — all four third-party npm packages must land in the consumer `package.json`, and the project must typecheck with one usage per component.
- [ ] **Step 3: Human QA checklist (for Oğuzhan, on the live site):**
  - Calendar: single + range selection in both themes; keyboard navigation; a real month change.
  - Carousel: pointer/touch drag on a real phone; button + ArrowKey navigation; end-state disabled buttons.
  - Chart: tooltip + legend hover in light AND dark (dark chart colors must visibly differ); resize the window — chart follows.
  - Resizable: drag + keyboard resize; double-click reset; nested vertical group; cursor changes while dragging.
  - Re-check the long-open wave-1 items: dark-mode toggle inside preview iframes; progress hydration animation.
- [ ] **Step 4:** `git tag v0.5.0 -m "wave 5: third-party wrapper components" && git push origin v0.5.0`.
- [ ] **Step 5:** Registry is at 54 components — full shadcn parity per the spec's ~50-item scope. Record wave-5 outcomes and open the blocks-phase discussion (out of scope here).

---

## Deferred (explicitly NOT in this plan)

- Calendar: `captionLayout="dropdown"` demo, locale/timezone demos, week numbers, `animate` prop, multiple-months-with-paged-navigation example — documented, not shipped as examples.
- Carousel: plugin examples (autoplay etc. — out of the dependency allowlist), vertical orientation demo, `setApi` dots/counter demo, slide-spacing variants.
- Chart: area/pie/radar demos, `RechartsThemeProvider` exploration, axis/grid `.recharts-*` selector audit beyond what Checkpoint C requires, tooltip `formatter` examples.
- Resizable: `useDefaultLayout` persistence demo, collapsible-panel demo (`collapsible` + `collapsedSize` + Enter key), pixel/rem-unit sizing examples.
- Any registry-wide dependency-pinning retrofit for `@base-ui/react` (bare-name convention stays for waves 1–4 items).
- Blocks/templates phase (spec: separate later phase) — wave 5 completes the ~50-item component scope.
