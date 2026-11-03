import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";

describe("Empty", () => {
  it("composes header, media, title, description and content parts", () => {
    render(
      <Empty data-testid="empty">
        <EmptyHeader data-testid="header">
          <EmptyMedia data-testid="media">
            <svg role="presentation" />
          </EmptyMedia>
          <EmptyTitle>No projects yet</EmptyTitle>
          <EmptyDescription>Create your first project.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent data-testid="content">
          <button type="button">New project</button>
        </EmptyContent>
      </Empty>,
    );
    const root = screen.getByTestId("empty");
    expect(root.getAttribute("data-slot")).toBe("empty");
    expect(screen.getByTestId("header").getAttribute("data-slot")).toBe(
      "empty-header",
    );
    expect(screen.getByTestId("media").getAttribute("data-slot")).toBe(
      "empty-icon",
    );
    expect(
      screen.getByText("No projects yet").getAttribute("data-slot"),
    ).toBe("empty-title");
    expect(
      screen.getByText("Create your first project.").getAttribute("data-slot"),
    ).toBe("empty-description");
    expect(screen.getByTestId("content").getAttribute("data-slot")).toBe(
      "empty-content",
    );
    expect(root.contains(screen.getByRole("button", { name: "New project" })))
      .toBe(true);
  });

  it("defaults EmptyMedia to the transparent variant", () => {
    render(<EmptyMedia data-testid="media" />);
    const media = screen.getByTestId("media");
    expect(media.getAttribute("data-variant")).toBe("default");
    expect(media.classList.contains("bg-transparent")).toBe(true);
    expect(media.classList.contains("bg-muted")).toBe(false);
  });

  it("applies icon variant tokens on EmptyMedia", () => {
    render(<EmptyMedia data-testid="media" variant="icon" />);
    const media = screen.getByTestId("media");
    expect(media.getAttribute("data-variant")).toBe("icon");
    expect(media.classList.contains("bg-surface-raised")).toBe(true);
    expect(media.classList.contains("bg-muted")).toBe(false);
    expect(media.classList.contains("bg-transparent")).toBe(false);
  });

  describe("v2 design language", () => {
    it("pads from --panel-pad, read with a fallback so density inherits", () => {
      render(<Empty data-testid="root" />);
      const cls = screen.getByTestId("root").className;
      expect(cls).toContain("p-[var(--panel-pad,1.125rem)]");
      expect(cls).not.toContain("[:where(&)]:[--panel-pad");
      expect(cls.split(" ")).not.toContain("p-6");
    });

    it("keeps the dashed border optional and draws it as a hairline", () => {
      render(<Empty data-testid="root" />);
      const classes = screen.getByTestId("root").className.split(" ");
      expect(classes).toContain("border-dashed");
      expect(classes).toContain("border-hairline-strong");
      // No border width of its own: a consumer adds `border` to show it.
      expect(classes).not.toContain("border");
    });

    it("raises the icon tile as a small square with a top highlight and hairline", () => {
      render(<EmptyMedia data-testid="media" variant="icon" />);
      const cls = screen.getByTestId("media").className;
      expect(cls).toContain("size-8");
      expect(cls).toContain("rounded-lg");
      expect(cls).toContain("var(--elevation-highlight,");
      expect(cls).toContain("var(--hairline-strong,");
    });

    it("sets title and description on the type scale", () => {
      render(
        <>
          <EmptyTitle>Title</EmptyTitle>
          <EmptyDescription>Description</EmptyDescription>
        </>,
      );
      expect(screen.getByText("Title").className).toContain("text-[0.9375rem]");
      expect(screen.getByText("Description").className).toContain("text-[0.8125rem]/relaxed");
    });
  });

  // A <div> keeps the description permissive (a <p> cannot contain flow content).
  it("renders EmptyDescription as a div", () => {
    render(<EmptyDescription>Nothing here.</EmptyDescription>);
    expect(screen.getByText("Nothing here.").tagName).toBe("DIV");
  });

  it("appends custom className on every part", () => {
    render(
      <Empty data-testid="empty" className="root-extra">
        <EmptyHeader data-testid="header" className="header-extra">
          <EmptyMedia data-testid="media" className="media-extra" />
          <EmptyTitle className="title-extra">T</EmptyTitle>
          <EmptyDescription className="desc-extra">D</EmptyDescription>
        </EmptyHeader>
        <EmptyContent data-testid="content" className="content-extra" />
      </Empty>,
    );
    expect(
      screen.getByTestId("empty").classList.contains("root-extra"),
    ).toBe(true);
    expect(
      screen.getByTestId("header").classList.contains("header-extra"),
    ).toBe(true);
    expect(
      screen.getByTestId("media").classList.contains("media-extra"),
    ).toBe(true);
    expect(screen.getByText("T").classList.contains("title-extra")).toBe(true);
    expect(screen.getByText("D").classList.contains("desc-extra")).toBe(true);
    expect(
      screen.getByTestId("content").classList.contains("content-extra"),
    ).toBe(true);
  });
});
