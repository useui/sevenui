import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/registry/base/ui/item";

describe("Item", () => {
  it("renders a div by default with state data attributes", () => {
    render(<Item data-testid="item">Basic</Item>);
    const item = screen.getByTestId("item");
    expect(item.tagName).toBe("DIV");
    expect(item.getAttribute("data-slot")).toBe("item");
    expect(item.getAttribute("data-variant")).toBe("default");
    expect(item.getAttribute("data-size")).toBe("default");
  });

  it("renders through a custom element via the render prop", () => {
    render(
      <Item render={<a href="/settings" />} className="item-extra">
        Settings
      </Item>,
    );
    const link = screen.getByRole("link", { name: "Settings" });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/settings");
    expect(link.getAttribute("data-slot")).toBe("item");
    expect(link.classList.contains("item-extra")).toBe(true);
  });

  it("applies variant tokens and data attributes", () => {
    const { rerender } = render(<Item data-testid="item">V</Item>);
    expect(
      screen.getByTestId("item").classList.contains("border-transparent"),
    ).toBe(true);
    rerender(
      <Item data-testid="item" variant="outline">
        V
      </Item>,
    );
    let item = screen.getByTestId("item");
    expect(item.getAttribute("data-variant")).toBe("outline");
    expect(item.classList.contains("border-border")).toBe(true);
    rerender(
      <Item data-testid="item" variant="muted">
        V
      </Item>,
    );
    item = screen.getByTestId("item");
    expect(item.getAttribute("data-variant")).toBe("muted");
    expect(item.classList.contains("bg-muted/50")).toBe(true);
  });

  it("reflects the size prop as data-size", () => {
    render(
      <Item data-testid="item" size="xs">
        S
      </Item>,
    );
    expect(screen.getByTestId("item").getAttribute("data-size")).toBe("xs");
  });

  it("composes media, content, title, description and actions", () => {
    render(
      <Item>
        <ItemMedia data-testid="media" variant="icon">
          <svg role="presentation" />
        </ItemMedia>
        <ItemContent data-testid="content">
          <ItemTitle>Storage almost full</ItemTitle>
          <ItemDescription>Upgrade to keep uploading files.</ItemDescription>
        </ItemContent>
        <ItemActions data-testid="actions">
          <button type="button">Upgrade</button>
        </ItemActions>
      </Item>,
    );
    expect(screen.getByTestId("media").getAttribute("data-slot")).toBe(
      "item-media",
    );
    expect(screen.getByTestId("media").getAttribute("data-variant")).toBe(
      "icon",
    );
    expect(screen.getByTestId("content").getAttribute("data-slot")).toBe(
      "item-content",
    );
    expect(
      screen.getByText("Storage almost full").getAttribute("data-slot"),
    ).toBe("item-title");
    const description = screen.getByText("Upgrade to keep uploading files.");
    expect(description.getAttribute("data-slot")).toBe("item-description");
    expect(description.tagName).toBe("P");
    expect(screen.getByTestId("actions").getAttribute("data-slot")).toBe(
      "item-actions",
    );
    expect(screen.getByRole("button", { name: "Upgrade" })).not.toBeNull();
  });

  it("renders header and footer rows spanning the item", () => {
    render(
      <Item>
        <ItemHeader data-testid="header">Header</ItemHeader>
        <ItemFooter data-testid="footer">Footer</ItemFooter>
      </Item>,
    );
    expect(screen.getByTestId("header").getAttribute("data-slot")).toBe(
      "item-header",
    );
    expect(screen.getByTestId("footer").getAttribute("data-slot")).toBe(
      "item-footer",
    );
  });
});

describe("ItemGroup", () => {
  it("renders a list container for items", () => {
    render(
      <ItemGroup className="group-extra">
        <Item>One</Item>
        <ItemSeparator />
        <Item>Two</Item>
      </ItemGroup>,
    );
    const list = screen.getByRole("list");
    expect(list.getAttribute("data-slot")).toBe("item-group");
    expect(list.classList.contains("group-extra")).toBe(true);
  });

  it("renders a horizontal separator between items", () => {
    render(
      <ItemGroup>
        <Item>One</Item>
        <ItemSeparator data-testid="separator" className="separator-extra" />
        <Item>Two</Item>
      </ItemGroup>,
    );
    const separator = screen.getByTestId("separator");
    expect(separator.getAttribute("data-slot")).toBe("item-separator");
    expect(separator.getAttribute("data-orientation")).toBe("horizontal");
    expect(separator.classList.contains("separator-extra")).toBe(true);
  });
});
