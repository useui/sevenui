import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Collapsible,
  CollapsibleContent,
} from "@/registry/base/ui/collapsible";
import {
  LayerCard,
  LayerCardAction,
  LayerCardDescription,
  LayerCardFooter,
  LayerCardHeader,
  LayerCardPanel,
  LayerCardTitle,
  layerCardVariants,
} from "@/registry/base/ui/layer-card";

describe("LayerCard", () => {
  it("renders a div with data-slot and default state attributes", () => {
    render(<LayerCard data-testid="root">Content</LayerCard>);
    const root = screen.getByTestId("root");
    expect(root.tagName).toBe("DIV");
    expect(root.getAttribute("data-slot")).toBe("layer-card");
    expect(root.getAttribute("data-variant")).toBe("default");
    expect(root.getAttribute("data-size")).toBe("default");
    expect(root.getAttribute("data-orientation")).toBe("vertical");
    expect(root.getAttribute("data-tone")).toBe("default");
    expect(root.hasAttribute("data-stacked")).toBe(false);
    expect(root.hasAttribute("data-dense")).toBe(false);
  });

  it("reflects every prop as a data attribute", () => {
    render(
      <LayerCard
        data-testid="root"
        variant="inverse"
        size="lg"
        orientation="horizontal"
        tone="destructive"
        stacked
        dense
      />,
    );
    const root = screen.getByTestId("root");
    expect(root.getAttribute("data-variant")).toBe("inverse");
    expect(root.getAttribute("data-size")).toBe("lg");
    expect(root.getAttribute("data-orientation")).toBe("horizontal");
    expect(root.getAttribute("data-tone")).toBe("destructive");
    expect(root.hasAttribute("data-stacked")).toBe(true);
    expect(root.hasAttribute("data-dense")).toBe(true);
  });

  it("appends a custom className to the root", () => {
    render(<LayerCard data-testid="root" className="custom-root" />);
    const root = screen.getByTestId("root");
    expect(root.className).toContain("custom-root");
    expect(root.className).toContain("rounded-(--layer-card-radius)");
  });

  it("keeps its variable defaults at zero specificity so a className override wins", () => {
    render(<LayerCard data-testid="root" />);
    expect(screen.getByTestId("root").className).toContain(
      "[:where(&)]:[--layer-card-radius:--theme(--radius-xl)]",
    );
  });

  it("inlines the theme radius so a scoped --radius reaches the tray", () => {
    // var(--radius-xl) is computed once on :root, so a --radius set on a
    // wrapper (a preset scope, a themed section) never reaches it. --theme()
    // inlines calc(var(--radius) + …) the way rounded-xl does on Card.
    render(<LayerCard data-testid="root" />);
    expect(screen.getByTestId("root").className).not.toContain("var(--radius-xl)");
  });

  it("renders the root through the render prop", () => {
    render(<LayerCard render={<section />} data-testid="root" />);
    const root = screen.getByTestId("root");
    expect(root.tagName).toBe("SECTION");
    expect(root.getAttribute("data-slot")).toBe("layer-card");
  });

  it("composes all parts with their data-slot attributes", () => {
    render(
      <LayerCard>
        <LayerCardHeader data-testid="header">
          <LayerCardTitle>Subrequests</LayerCardTitle>
          <LayerCardDescription>Origins called.</LayerCardDescription>
          <LayerCardAction data-testid="action">Edit</LayerCardAction>
        </LayerCardHeader>
        <LayerCardPanel data-testid="panel">Body</LayerCardPanel>
        <LayerCardFooter data-testid="footer">Footer</LayerCardFooter>
      </LayerCard>,
    );
    const slot = (el: HTMLElement) => el.getAttribute("data-slot");
    expect(slot(screen.getByTestId("header"))).toBe("layer-card-header");
    expect(slot(screen.getByText("Subrequests"))).toBe("layer-card-title");
    expect(slot(screen.getByText("Origins called."))).toBe("layer-card-description");
    expect(slot(screen.getByTestId("action"))).toBe("layer-card-action");
    expect(slot(screen.getByTestId("panel"))).toBe("layer-card-panel");
    expect(slot(screen.getByTestId("footer"))).toBe("layer-card-footer");
  });

  it("merges className on every part", () => {
    render(
      <LayerCard>
        <LayerCardHeader className="c-header">
          <LayerCardTitle className="c-title">T</LayerCardTitle>
          <LayerCardDescription className="c-desc">D</LayerCardDescription>
          <LayerCardAction className="c-action">A</LayerCardAction>
        </LayerCardHeader>
        <LayerCardPanel className="c-panel">P</LayerCardPanel>
        <LayerCardFooter className="c-footer">F</LayerCardFooter>
      </LayerCard>,
    );
    for (const name of ["header", "title", "desc", "action", "panel", "footer"]) {
      expect(document.querySelector(`.c-${name}`)).not.toBeNull();
    }
  });

  it("renders the panel as a link that keeps href and data-slot", () => {
    render(
      <LayerCard>
        <LayerCardPanel render={<a href="/docs" />}>Docs</LayerCardPanel>
      </LayerCard>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.getAttribute("href")).toBe("/docs");
    expect(link.getAttribute("data-slot")).toBe("layer-card-panel");
    expect(link.className).toContain("[a,button]:focus-visible:focus-ring");
    expect(link.className).not.toContain("ring-3");
    expect(link.className).not.toContain("focus-visible:border-ring");
  });

  it("keeps the panel slot when another component passes its own data-slot", () => {
    render(
      <LayerCard>
        <LayerCardPanel data-slot="collapsible-content" data-testid="panel">
          Body
        </LayerCardPanel>
      </LayerCard>,
    );
    expect(screen.getByTestId("panel").getAttribute("data-slot")).toBe(
      "layer-card-panel",
    );
  });

  it("stays a panel when rendered through a Collapsible panel", () => {
    render(
      <Collapsible defaultOpen>
        <LayerCard data-testid="root">
          <CollapsibleContent keepMounted render={<LayerCardPanel />}>
            Steps
          </CollapsibleContent>
        </LayerCard>
      </Collapsible>,
    );
    expect(
      screen.getByTestId("root").querySelector('[data-slot="layer-card-panel"]'),
    ).not.toBeNull();
  });

  it("renders the title as a heading through the render prop", () => {
    render(
      <LayerCard>
        <LayerCardHeader>
          {/* biome-ignore lint/a11y/useHeadingContent: useRender fills the heading with the title's children */}
          <LayerCardTitle render={<h3 />}>Usage</LayerCardTitle>
        </LayerCardHeader>
      </LayerCard>,
    );
    const heading = screen.getByRole("heading", { level: 3, name: "Usage" });
    expect(heading.getAttribute("data-slot")).toBe("layer-card-title");
  });

  it("grows by default and keeps content size with fit", () => {
    render(
      <LayerCard>
        <LayerCardPanel data-testid="grow">A</LayerCardPanel>
        <LayerCardPanel data-testid="fit" fit>
          B
        </LayerCardPanel>
      </LayerCard>,
    );
    expect(screen.getByTestId("grow").className).toContain("grow");
    expect(screen.getByTestId("grow").hasAttribute("data-fit")).toBe(false);
    expect(screen.getByTestId("fit").className).not.toMatch(/(^|\s)grow(\s|$)/);
    expect(screen.getByTestId("fit").hasAttribute("data-fit")).toBe(true);
  });

  it("excludes fit panels from the horizontal zero basis", () => {
    expect(layerCardVariants({ orientation: "horizontal" })).toContain(
      "[&>[data-slot=layer-card-panel]:not([data-fit])]:@md/layer-card:basis-0",
    );
  });

  it("scopes the zero basis and the full basis to disjoint container widths", () => {
    // The :not([data-fit]) selector outranks the plain full-basis selector, so
    // if both applied below @md the panels would never stack.
    const classes = layerCardVariants({ orientation: "horizontal" }).split(" ");
    const basis = classes.filter(
      (c) => c.includes("layer-card-panel") && /:basis-(0|full)$/.test(c),
    );
    expect(basis).toEqual([
      "[&>[data-slot=layer-card-panel]:not([data-fit])]:@md/layer-card:basis-0",
      "[&>[data-slot=layer-card-panel]]:@max-md/layer-card:basis-full",
    ]);
  });

  it("insets the focus ring of panels under dense, where the root clips", () => {
    // A negative gap draws the offset ring inside the panel's own edge.
    expect(layerCardVariants({ dense: true })).toContain(
      "[&>[data-slot=layer-card-panel]]:focus-visible:[--focus-gap:calc(var(--focus-width)*-2)]",
    );
  });

  it("zeroes the bar padding in surface mode so header and body align", () => {
    const classes = layerCardVariants();
    expect(classes).toContain(
      "[&:not(:has([data-slot=layer-card-panel]))]:[--layer-card-bar-px:0px]",
    );
    expect(classes).toContain(
      "[&:not(:has([data-slot=layer-card-panel]))]:[--layer-card-bar-py:0px]",
    );
  });

  it("aligns link and button panel text to the logical start", () => {
    render(
      <LayerCard>
        <LayerCardPanel render={<a href="/docs" />}>Docs</LayerCardPanel>
      </LayerCard>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.className).toContain("[a,button]:text-start");
    expect(link.className).not.toContain("text-left");
  });

  it("layers the destructive tone over the variant tray instead of replacing it", () => {
    expect(layerCardVariants({ tone: "destructive" })).toContain(
      "[--layer-card-tone-mix:6%]",
    );
    expect(layerCardVariants({ tone: "default" })).toContain(
      "[--layer-card-tone-mix:0%]",
    );
    // The base colour comes first: Tailwind's fallback for browsers without
    // color-mix() is the first colour, which must not be the destructive one.
    expect(layerCardVariants()).toContain(
      "bg-[color:color-mix(in_oklch,var(--layer-card-fill),var(--destructive)_var(--layer-card-tone-mix))]",
    );
    // The fill is the tray in panel mode and the panel colour in surface mode.
    expect(layerCardVariants()).toContain(
      "[:where(&)]:[--layer-card-fill:var(--layer-card-bg)]",
    );
    expect(layerCardVariants()).toContain(
      "[&:not(:has([data-slot=layer-card-panel]))]:[--layer-card-fill:var(--layer-card-panel-bg)]",
    );
  });

  it("gives inverse panels an opaque background so a tone never shows through", () => {
    expect(layerCardVariants({ variant: "inverse" })).toContain(
      "[--layer-card-panel-bg:var(--surface-tray,color-mix(in_oklch,var(--muted)_50%,var(--card)))]",
    );
  });

  it("lifts a focused link panel above its stacked neighbour", () => {
    render(
      <LayerCard stacked>
        <LayerCardPanel render={<a href="/a" />}>A</LayerCardPanel>
        <LayerCardPanel render={<a href="/b" />}>B</LayerCardPanel>
      </LayerCard>,
    );
    expect(screen.getByRole("link", { name: "A" }).className).toContain(
      "[a,button]:focus-visible:z-10",
    );
  });

  it("rounds only the outer panel corners under vertical dense instead of clipping", () => {
    const classes = layerCardVariants({ dense: true });
    // No clipping: a clipping tray cuts off focus rings in the bars.
    expect(classes.split(" ")).not.toContain("overflow-hidden");
    expect(classes).toContain(
      "[&>[data-slot=layer-card-panel]]:[--layer-card-panel-radius:0px]",
    );
    expect(classes).toContain(
      "[&>[data-slot=layer-card-panel]:first-child]:rounded-t-[max(0px,calc(var(--layer-card-radius)_-_var(--layer-card-border-width)))]",
    );
    expect(classes).toContain(
      "[&>[data-slot=layer-card-panel]:last-child]:rounded-b-[max(0px,calc(var(--layer-card-radius)_-_var(--layer-card-border-width)))]",
    );
  });

  it("aligns the bars with panel text under vertical dense, where panels lose their side border", () => {
    expect(layerCardVariants({ dense: true })).toContain(
      "[--layer-card-bar-px:var(--layer-card-panel-px)]",
    );
  });

  it("drives surface mode through variables only, so consumer classes can win", () => {
    // A surface rule that sets padding, background or shadow directly sits at
    // (0,2,0) and beats a consumer's p-6 / bg-* / shadow-none. Setting
    // variables instead leaves the properties on plain (0,1,0) classes.
    const surface = layerCardVariants()
      .split(" ")
      .filter((c) => c.startsWith("[&:not(:has([data-slot=layer-card-panel]))]:"));
    expect(surface.length).toBeGreaterThan(0);
    for (const c of surface) {
      expect(c).toMatch(/\]:\[--layer-card-[a-z-]+:/);
    }
  });

  it("lets a consumer padding, background or shadow class replace the defaults", () => {
    render(
      <LayerCard data-testid="root" className="p-6 bg-red-500 shadow-none">
        Surface
      </LayerCard>,
    );
    const classes = screen.getByTestId("root").className.split(" ");
    expect(classes).toContain("p-6");
    expect(classes).toContain("bg-red-500");
    expect(classes).toContain("shadow-none");
    expect(classes.some((c) => /^p[xy]?-\(--layer-card/.test(c))).toBe(false);
    expect(classes.some((c) => c.startsWith("bg-[color:"))).toBe(false);
    expect(classes.some((c) => /^shadow-.*layer-card/.test(c))).toBe(false);
  });

  it("lifts panels off the tray through the panel token, without a dark: override", () => {
    // --surface-panel is color-mix(card, foreground 4%) in dark, which is
    // what the old dark: override wrote by hand.
    for (const variant of ["default", "ghost"] as const) {
      const classes = layerCardVariants({ variant });
      expect(classes).toContain("[--layer-card-panel-bg:var(--surface-panel,var(--card))]");
      expect(classes).not.toContain("dark:[--layer-card-panel-bg");
    }
  });

  describe("v2 design language", () => {
    it("points the tray, panel and hairline at the surface tokens, with the old values as fallbacks", () => {
      const classes = layerCardVariants();
      expect(classes).toContain(
        "[--layer-card-bg:var(--surface-tray,color-mix(in_oklch,var(--muted)_50%,transparent))]",
      );
      expect(classes).toContain("[--layer-card-panel-bg:var(--surface-panel,var(--card))]");
      expect(classes).toContain(
        "[:where(&)]:[--layer-card-border-color:var(--hairline,color-mix(in_oklch,var(--foreground)_10%,transparent))]",
      );
      expect(layerCardVariants({ variant: "inverse" })).toContain(
        "[--layer-card-bg:var(--surface-panel,var(--card))]",
      );
    });

    it("keeps every variable default at zero specificity", () => {
      const classes = layerCardVariants();
      for (const name of [
        "radius",
        "pad-x",
        "pad-y",
        "fill",
        "shadow",
        "border-color",
        "panel-radius",
        "bar-px",
      ]) {
        expect(classes).toContain(`[:where(&)]:[--layer-card-${name}:`);
      }
      // Shared token variables are inherited, never declared on the root: a
      // declaration here would shadow an ancestor's value.
      expect(classes).not.toMatch(/\[:where\(&\)\]:\[--(focus|control|panel|item)-/);
    });

    it("raises the tray with the top highlight and panels with the raised elevation", () => {
      expect(layerCardVariants()).toContain(
        "[:where(&)]:[--layer-card-shadow:var(--elevation-highlight,0_0_#0000)]",
      );
      render(
        <LayerCard>
          <LayerCardPanel data-testid="panel">P</LayerCardPanel>
        </LayerCard>,
      );
      const panel = screen.getByTestId("panel").className;
      expect(panel).toContain("shadow-[var(--elevation-raised,");
      expect(panel.split(" ")).not.toContain("shadow-xs");
    });

    it("pads panels from --panel-pad through a var() fallback, so an ancestor's density reaches them", () => {
      expect(layerCardVariants()).toContain(
        "[--layer-card-panel-px:var(--panel-pad,1.125rem)]",
      );
      expect(layerCardVariants({ size: "sm" })).toContain(
        "[--layer-card-panel-py:calc(var(--panel-pad,1.125rem)*0.75)]",
      );
      expect(layerCardVariants()).not.toContain("[:where(&)]:[--panel-pad");
      // --layer-card-inset is not density-driven.
      expect(layerCardVariants()).toContain("[--layer-card-inset:--spacing(1)]");
    });

    it("drops the hover transition under reduced motion", () => {
      render(
        <LayerCard>
          <LayerCardPanel render={<a href="/docs" />}>Docs</LayerCardPanel>
        </LayerCard>,
      );
      expect(screen.getByRole("link", { name: "Docs" }).className).toContain(
        "[a,button]:motion-reduce:transition-none",
      );
    });
  });

  it("exports layerCardVariants as a callable class builder", () => {
    expect(typeof layerCardVariants()).toBe("string");
    expect(layerCardVariants({ variant: "ghost" })).toContain("border-0");
  });

  it("declares a client boundary, because useRender calls useRef", () => {
    const source = readFileSync(
      join(__dirname, "../registry/base/ui/layer-card.tsx"),
      "utf8",
    );
    expect(source.startsWith('"use client";')).toBe(true);
  });
});
