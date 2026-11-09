import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { cn } from "cn";
import { describe, expect, it, vi } from "vitest";
import registry from "../registry.json";
import { AA, contrastOn, destructivePull, destructiveTint, mix, type Oklch, palette } from "./helpers/palette";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/registry/base/ui/attachment";
import { buttonVariants } from "@/registry/base/ui/button";

function FileAttachment(props: React.ComponentProps<typeof Attachment>) {
  return (
    <Attachment {...props}>
      <AttachmentMedia>
        <svg aria-hidden="true" />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>quarterly-report.pdf</AttachmentTitle>
        <AttachmentDescription>1.2 MB · PDF</AttachmentDescription>
      </AttachmentContent>
    </Attachment>
  );
}

describe("Attachment", () => {
  it("renders the file title and description", () => {
    render(<FileAttachment />);
    expect(screen.getByText("quarterly-report.pdf")).not.toBeNull();
    expect(screen.getByText("1.2 MB · PDF")).not.toBeNull();
  });

  it("exposes default state, size, and orientation as data attributes", () => {
    render(<FileAttachment data-testid="attachment" />);
    const root = screen.getByTestId("attachment");
    expect(root.getAttribute("data-state")).toBe("done");
    expect(root.getAttribute("data-size")).toBe("default");
    expect(root.getAttribute("data-orientation")).toBe("horizontal");
  });

  it("reflects custom state, size, and orientation", () => {
    render(
      <FileAttachment
        data-testid="attachment"
        state="uploading"
        size="xs"
        orientation="vertical"
      />,
    );
    const root = screen.getByTestId("attachment");
    expect(root.getAttribute("data-state")).toBe("uploading");
    expect(root.getAttribute("data-size")).toBe("xs");
    expect(root.getAttribute("data-orientation")).toBe("vertical");
  });

  it("appends a custom className after the variant classes", () => {
    render(<FileAttachment data-testid="attachment" className="w-full" />);
    const root = screen.getByTestId("attachment");
    expect(root.className).toContain("w-full");
    // Base classes stay intact.
    expect(root.className).toContain("rounded-2xl");
  });

  it("tags every composition part with a data-slot", () => {
    const { container } = render(<FileAttachment />);
    for (const slot of [
      "attachment",
      "attachment-media",
      "attachment-content",
      "attachment-title",
      "attachment-description",
    ]) {
      expect(container.querySelector(`[data-slot="${slot}"]`)).not.toBeNull();
    }
  });

  it("renders media with the requested variant", () => {
    const { container } = render(
      <Attachment>
        <AttachmentMedia variant="image">
          <img src="/placeholder.svg" alt="" />
        </AttachmentMedia>
      </Attachment>,
    );
    const media = container.querySelector('[data-slot="attachment-media"]');
    expect(media?.getAttribute("data-variant")).toBe("image");
    expect(media?.querySelector("img")).not.toBeNull();
  });
});

describe("AttachmentAction", () => {
  it("fires its click handler", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <Attachment>
        <AttachmentActions>
          <AttachmentAction aria-label="Remove file" onClick={onRemove}>
            <svg aria-hidden="true" />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>,
    );
    await user.click(screen.getByRole("button", { name: "Remove file" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("does not fire when disabled", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <Attachment>
        <AttachmentActions>
          <AttachmentAction aria-label="Remove file" disabled onClick={onRemove}>
            <svg aria-hidden="true" />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>,
    );
    await user.click(screen.getByRole("button", { name: "Remove file", hidden: true }));
    expect(onRemove).not.toHaveBeenCalled();
  });
});

describe("AttachmentTrigger", () => {
  it("renders a type=button by default and fires onClick", async () => {
    const user = userEvent.setup();
    const onPreview = vi.fn();
    render(
      <Attachment>
        <AttachmentTrigger aria-label="Preview file" onClick={onPreview} />
      </Attachment>,
    );
    const trigger = screen.getByRole("button", { name: "Preview file" });
    expect(trigger.getAttribute("type")).toBe("button");
    expect(trigger.getAttribute("data-slot")).toBe("attachment-trigger");
    await user.click(trigger);
    expect(onPreview).toHaveBeenCalledTimes(1);
  });

  it("supports rendering as a link via the render prop", () => {
    render(
      <Attachment>
        <AttachmentTrigger render={<a href="/files/report.pdf" />}>
          Open report
        </AttachmentTrigger>
      </Attachment>,
    );
    const link = screen.getByRole("link", { name: "Open report" });
    expect(link.getAttribute("href")).toBe("/files/report.pdf");
    // The default button type must not leak onto the anchor.
    expect(link.hasAttribute("type")).toBe(false);
  });

  it("appends a custom className to the overlay classes", () => {
    render(
      <Attachment>
        <AttachmentTrigger aria-label="Preview" className="cursor-zoom-in" />
      </Attachment>,
    );
    const trigger = screen.getByRole("button", { name: "Preview" });
    expect(trigger.className).toContain("cursor-zoom-in");
    expect(trigger.className).toContain("absolute");
  });
});

describe("AttachmentGroup", () => {
  it("renders multiple attachments", () => {
    const { container } = render(
      <AttachmentGroup>
        <FileAttachment />
        <FileAttachment />
      </AttachmentGroup>,
    );
    expect(
      container.querySelectorAll('[data-slot="attachment"]'),
    ).toHaveLength(2);
  });

  it("renders an empty group without children", () => {
    const { container } = render(<AttachmentGroup data-testid="group" />);
    const group = container.querySelector('[data-slot="attachment-group"]');
    expect(group).not.toBeNull();
    expect(group?.childElementCount).toBe(0);
  });

  it("appends a custom className", () => {
    render(<AttachmentGroup data-testid="group" className="max-w-md" />);
    const group = screen.getByTestId("group");
    expect(group.className).toContain("max-w-md");
    expect(group.className).toContain("overflow-x-auto");
  });
});

describe("Attachment v2 styles", () => {
  it("draws the tile as main's bordered card with its focus-within ring", () => {
    render(<FileAttachment data-testid="attachment" />);
    const cls = screen.getByTestId("attachment").className;
    expect(cls.split(" ")).toEqual(
      expect.arrayContaining([
        "border",
        "bg-card",
        "has-[>a,>button]:hover:bg-muted/50",
        "focus-within:ring-1",
        "focus-within:ring-ring/30",
      ]),
    );
    expect(cls).not.toMatch(/\[:where\(&\)\]:\[--(control|focus)/);
    expect(cls).not.toContain("focus-ring");
    expect(cls).not.toContain("hairline");
    expect(cls).not.toContain("surface-");
  });

  it("transitions only background and border colours, and not under reduced motion", () => {
    render(<FileAttachment data-testid="attachment" />);
    const cls = screen.getByTestId("attachment").className.split(/\s+/);
    expect(cls).not.toContain("transition-colors");
    expect(cls).toContain("transition-[background-color,border-color]");
    expect(cls).toContain("motion-reduce:transition-none");
  });

  it("rounds the media concentrically inside the tile padding", () => {
    const { container } = render(<FileAttachment />);
    const cls = (
      container.querySelector('[data-slot="attachment-media"]') as HTMLElement
    ).className;
    expect(cls).toContain(
      "rounded-[max(0px,calc(--theme(--radius-2xl)-0.5rem))]",
    );
    expect(cls).toContain(
      "group-data-[size=xs]/attachment:rounded-[max(0px,calc(--theme(--radius-xl)-0.25rem))]",
    );
  });

  it("renders the remove action as a ghost xs icon button", () => {
    render(
      <Attachment>
        <AttachmentActions>
          <AttachmentAction aria-label="Remove">x</AttachmentAction>
        </AttachmentActions>
      </Attachment>,
    );
    // Compare against the button variants themselves so the assertion follows
    // the button restyle instead of pinning one of its classes (merged through
    // cn exactly as Button merges them).
    const expected = cn(buttonVariants({ variant: "ghost", size: "icon-xs" }))
      .split(/\s+/)
      .filter(Boolean);
    expect(expected.length).toBeGreaterThan(0);
    const action = screen.getByRole("button", { name: "Remove" });
    for (const c of expected) {
      expect(action.classList.contains(c)).toBe(true);
    }
  });
});

// --- Contrast -------------------------------------------------------------
// A failed attachment tints its media destructive and recolours the media and
// description text. Both must reach AA on the card tile, at rest and on the
// interactive tile's hover (muted at 50% over the card). The hover tile lies
// between card and muted, so passing on both bounds it.

function mutedOf(mode: "light" | "dark"): Oklch {
  const theme = registry.items.find((i) => i.name === "theme")?.cssVars as unknown as Record<
    string,
    Record<string, string>
  >;
  const m = theme[mode].muted.match(/^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/);
  if (!m) throw new Error(`Unsupported colour: ${theme[mode].muted}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

describe("Failed attachment contrast (AA)", () => {
  it.each(["light", "dark"] as const)("media and description text reach AA in %s", (mode) => {
    render(
      <Attachment data-testid="attachment" state="error">
        <AttachmentMedia data-testid="media">PDF</AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>report.pdf</AttachmentTitle>
          <AttachmentDescription data-testid="description">Upload failed</AttachmentDescription>
        </AttachmentContent>
      </Attachment>,
    );
    const error = "group-data-[state=error]/attachment:";
    const media = screen.getByTestId("media").className;
    const description = screen.getByTestId("description").className;
    const tint = destructiveTint(media, error);
    const mediaPull = destructivePull(media, error);
    const descriptionPull = destructivePull(description, error);
    for (const n of [tint, mediaPull, descriptionPull]) expect(n).not.toBeNaN();
    expect(description).not.toContain("text-destructive/");

    const p = palette(mode);
    const muted = mutedOf(mode);
    const tiles = { rest: p.surfaces.card, "hover bound": muted };
    const ratios = Object.entries(tiles).flatMap(([state, tile]) => [
      [`media ${state}`, contrastOn(mix(p.foreground, mediaPull, p.destructive), tile, { color: p.destructive, alpha: tint })],
      [`description ${state}`, contrastOn(mix(p.foreground, descriptionPull, p.destructive), tile)],
    ] as const);
    const report = ratios.map(([n, r]) => `${n} ${r.toFixed(2)}`).join(", ");
    expect(Math.min(...ratios.map(([, r]) => r)), `${mode}: ${report}`).toBeGreaterThanOrEqual(AA);
  });
});
