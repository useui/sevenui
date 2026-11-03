import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
} from "@/registry/base/ui/bubble";
import { AA, contrastOn, destructivePull, destructiveTint, mix, palette } from "./helpers/palette";

describe("Bubble", () => {
  it("renders its content", () => {
    render(
      <Bubble>
        <BubbleContent>See you at 3pm.</BubbleContent>
      </Bubble>,
    );
    expect(screen.getByText("See you at 3pm.")).not.toBeNull();
  });

  it("defaults to the default variant aligned to start", () => {
    render(<Bubble data-testid="bubble" />);
    const bubble = screen.getByTestId("bubble");
    expect(bubble.getAttribute("data-variant")).toBe("default");
    expect(bubble.getAttribute("data-align")).toBe("start");
  });

  it("reflects align=end", () => {
    render(<Bubble data-testid="bubble" align="end" />);
    expect(screen.getByTestId("bubble").getAttribute("data-align")).toBe("end");
  });

  it.each([
    "default",
    "secondary",
    "muted",
    "tinted",
    "outline",
    "ghost",
    "destructive",
  ] as const)("reflects the %s variant as a data attribute", (variant) => {
    render(<Bubble data-testid="bubble" variant={variant} />);
    expect(screen.getByTestId("bubble").getAttribute("data-variant")).toBe(
      variant,
    );
  });

  it("appends a custom className after the variant classes", () => {
    render(<Bubble data-testid="bubble" className="shadow-sm" />);
    const bubble = screen.getByTestId("bubble");
    expect(bubble.className).toContain("shadow-sm");
    expect(bubble.className).toContain("max-w-[80%]");
  });
});

describe("BubbleContent", () => {
  it("renders a div with the bubble-content slot by default", () => {
    const { container } = render(
      <Bubble>
        <BubbleContent>Hello</BubbleContent>
      </Bubble>,
    );
    const content = container.querySelector('[data-slot="bubble-content"]');
    expect(content).not.toBeNull();
    expect(content?.tagName).toBe("DIV");
  });

  it("supports rendering as an interactive button via the render prop", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(
      <Bubble>
        <BubbleContent render={<button type="button" />} onClick={onOpen}>
          Tap to expand
        </BubbleContent>
      </Bubble>,
    );
    const button = screen.getByRole("button", { name: "Tap to expand" });
    expect(button.getAttribute("data-slot")).toBe("bubble-content");
    await user.click(button);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("appends a custom className", () => {
    const { container } = render(
      <Bubble>
        <BubbleContent className="font-mono">code</BubbleContent>
      </Bubble>,
    );
    const content = container.querySelector('[data-slot="bubble-content"]');
    expect(content?.className).toContain("font-mono");
    expect(content?.className).toContain("rounded-xl");
  });
});

describe("BubbleReactions", () => {
  it("defaults to bottom side aligned to end", () => {
    render(<Bubble>{<BubbleReactions data-testid="reactions">1</BubbleReactions>}</Bubble>);
    const reactions = screen.getByTestId("reactions");
    expect(reactions.getAttribute("data-side")).toBe("bottom");
    expect(reactions.getAttribute("data-align")).toBe("end");
    expect(reactions.textContent).toBe("1");
  });

  it("reflects a custom side and align", () => {
    render(
      <Bubble>
        <BubbleReactions data-testid="reactions" side="top" align="start" />
      </Bubble>,
    );
    const reactions = screen.getByTestId("reactions");
    expect(reactions.getAttribute("data-side")).toBe("top");
    expect(reactions.getAttribute("data-align")).toBe("start");
  });

  it("renders interactive reaction buttons that fire callbacks", async () => {
    const user = userEvent.setup();
    const onReact = vi.fn();
    render(
      <Bubble>
        <BubbleContent>Great news!</BubbleContent>
        <BubbleReactions>
          <button type="button" onClick={() => onReact("party")}>
            party 2
          </button>
        </BubbleReactions>
      </Bubble>,
    );
    await user.click(screen.getByRole("button", { name: "party 2" }));
    expect(onReact).toHaveBeenCalledWith("party");
  });
});

describe("BubbleGroup", () => {
  it("groups multiple bubbles", () => {
    const { container } = render(
      <BubbleGroup>
        <Bubble>
          <BubbleContent>First</BubbleContent>
        </Bubble>
        <Bubble>
          <BubbleContent>Second</BubbleContent>
        </Bubble>
      </BubbleGroup>,
    );
    const group = container.querySelector('[data-slot="bubble-group"]');
    expect(group?.querySelectorAll('[data-slot="bubble"]')).toHaveLength(2);
  });

  it("renders empty without children and appends a custom className", () => {
    render(<BubbleGroup data-testid="group" className="gap-4" />);
    const group = screen.getByTestId("group");
    expect(group.childElementCount).toBe(0);
    expect(group.className).toContain("gap-4");
    expect(group.className).toContain("flex-col");
  });
});

describe("Bubble v2 styles", () => {
  const contentSel = "*:data-[slot=bubble-content]:";

  it("draws the default (user) bubble on a raised surface with a hairline", () => {
    render(<Bubble data-testid="bubble" />);
    const cls = screen.getByTestId("bubble").className;
    expect(cls).toContain(`${contentSel}bg-surface-raised`);
    expect(cls).toContain(`${contentSel}text-foreground`);
    expect(cls).toContain(`${contentSel}shadow-[inset_0_0_0_1px_var(--hairline`);
    expect(cls).not.toContain("bg-primary");
  });

  it("keeps the ghost (assistant) bubble as plain text", () => {
    render(<Bubble data-testid="bubble" variant="ghost" />);
    const cls = screen.getByTestId("bubble").className;
    expect(cls).toContain(`${contentSel}bg-transparent`);
    expect(cls).toContain(`${contentSel}p-0`);
    expect(cls).toContain(`${contentSel}shadow-none`);
  });

  it("pads the content from the density tokens and uses the offset focus ring", () => {
    const { container } = render(
      <Bubble>
        <BubbleContent>Hello</BubbleContent>
      </Bubble>,
    );
    const cls = (
      container.querySelector('[data-slot="bubble-content"]') as HTMLElement
    ).className;
    expect(cls).toContain("px-[var(--control-px,0.75rem)]");
    expect(cls).toContain("py-[calc(var(--control-px,0.75rem)*0.66)]");
    // Declaring density vars on the element would shadow a compact ancestor.
    expect(cls).not.toMatch(/\[:where\(&\)\]:\[--(control|focus)/);
    expect(cls).toContain("[button,a]:focus-visible:focus-ring");
    expect(cls).not.toContain("ring-3");
    expect(cls).not.toContain("ring-ring");
    expect(cls).not.toContain("focus-visible:border-ring");
  });

  it("separates reactions with a hairline instead of a ring-3 cutout", () => {
    render(
      <Bubble>
        <BubbleReactions data-testid="reactions">1</BubbleReactions>
      </Bubble>,
    );
    const cls = screen.getByTestId("reactions").className;
    expect(cls).toContain("bg-surface-raised");
    expect(cls).toContain("var(--hairline-strong");
    expect(cls).not.toContain("ring-3");
  });
});

// --- Contrast -------------------------------------------------------------
// The destructive bubble's text must reach AA on its tint at rest and on the
// interactive (button/link) hover tint, over the page, a card and a panel.

describe("Destructive bubble contrast (AA)", () => {
  const cases = (["light", "dark"] as const).flatMap((mode) =>
    (["rest", "hover"] as const).map((state) => ({ mode, state })),
  );

  it.each(cases)("text reaches AA on the $state tint in $mode", ({ mode, state }) => {
    render(<Bubble data-testid="bubble" variant="destructive" />);
    const classes = screen.getByTestId("bubble").className;
    const dark = mode === "dark" ? "dark:" : "";
    const prefix =
      state === "rest"
        ? `${dark}*:data-[slot=bubble-content]:`
        : `${dark}[&>[data-slot=bubble-content]:is(button,a):hover]:`;
    const alpha = destructiveTint(classes, prefix);
    const pull = destructivePull(classes, "*:data-[slot=bubble-content]:");
    expect(alpha).not.toBeNaN();
    expect(pull).toBeGreaterThan(0);
    const p = palette(mode);
    const text = mix(p.foreground, pull, p.destructive);
    const surfaces = { background: p.surfaces.background, card: p.surfaces.card, panel: p.surfaces.panel };
    const ratios = Object.entries(surfaces).map(
      ([name, s]) => [name, contrastOn(text, s, { color: p.destructive, alpha })] as const,
    );
    const report = ratios.map(([n, r]) => `${n} ${r.toFixed(2)}`).join(", ");
    expect(Math.min(...ratios.map(([, r]) => r)), `${mode} ${state}: ${report}`).toBeGreaterThanOrEqual(AA);
  });
});
