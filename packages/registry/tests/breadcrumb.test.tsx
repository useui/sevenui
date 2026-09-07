import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/base/ui/breadcrumb";

function Trail() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

describe("Breadcrumb", () => {
  it("renders a nav landmark labeled 'breadcrumb'", () => {
    render(<Trail />);
    const nav = screen.getByRole("navigation", { name: "breadcrumb" });
    expect(nav.getAttribute("data-slot")).toBe("breadcrumb");
  });

  it("renders links as anchors with their hrefs", () => {
    render(<Trail />);
    const home = screen.getByRole("link", { name: "Home" });
    expect(home.tagName).toBe("A");
    expect(home.getAttribute("href")).toBe("/");
    expect(home.getAttribute("data-slot")).toBe("breadcrumb-link");
  });

  it("marks the current page with aria-current='page'", () => {
    render(<Trail />);
    const page = screen.getByText("Breadcrumb");
    expect(page.getAttribute("aria-current")).toBe("page");
    expect(page.getAttribute("aria-disabled")).toBe("true");
    expect(page.getAttribute("data-slot")).toBe("breadcrumb-page");
  });

  it("hides separators from the accessibility tree", () => {
    const { container } = render(<Trail />);
    const separators = container.querySelectorAll(
      '[data-slot="breadcrumb-separator"]',
    );
    expect(separators).toHaveLength(2);
    for (const separator of separators) {
      expect(separator.getAttribute("aria-hidden")).toBe("true");
      expect(separator.getAttribute("role")).toBe("presentation");
    }
    // Only the three BreadcrumbItems count as list items; separators do not.
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("renders a chevron by default and accepts custom separator content", () => {
    const { container } = render(
      <BreadcrumbList>
        <BreadcrumbSeparator data-testid="default-separator" />
        <BreadcrumbSeparator data-testid="custom-separator">/</BreadcrumbSeparator>
      </BreadcrumbList>,
    );
    expect(
      container
        .querySelector('[data-testid="default-separator"]')
        ?.querySelector("svg"),
    ).not.toBeNull();
    expect(screen.getByTestId("custom-separator").textContent).toBe("/");
  });

  it("supports rendering the link through a custom element", () => {
    render(
      <BreadcrumbLink render={<span data-testid="router-link" />}>
        Home
      </BreadcrumbLink>,
    );
    const link = screen.getByTestId("router-link");
    expect(link.tagName).toBe("SPAN");
    expect(link.textContent).toBe("Home");
    expect(link.getAttribute("data-slot")).toBe("breadcrumb-link");
  });

  it("hides the ellipsis from assistive tech while keeping sr-only text", () => {
    render(<BreadcrumbEllipsis data-testid="ellipsis" />);
    const ellipsis = screen.getByTestId("ellipsis");
    expect(ellipsis.getAttribute("aria-hidden")).toBe("true");
    expect(ellipsis.getAttribute("role")).toBe("presentation");
    const srOnly = screen.getByText("More");
    expect(srOnly.classList.contains("sr-only")).toBe(true);
  });

  it("appends custom className on list, item, link and page", () => {
    render(
      <Breadcrumb className="nav-extra">
        <BreadcrumbList className="list-extra">
          <BreadcrumbItem className="item-extra">
            <BreadcrumbLink href="/" className="link-extra">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage className="page-extra">Now</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );
    expect(
      screen.getByRole("navigation").classList.contains("nav-extra"),
    ).toBe(true);
    expect(screen.getByRole("list").classList.contains("list-extra")).toBe(
      true,
    );
    expect(
      screen.getAllByRole("listitem")[0].classList.contains("item-extra"),
    ).toBe(true);
    expect(
      screen.getByRole("link", { name: "Home" }).classList.contains(
        "link-extra",
      ),
    ).toBe(true);
    expect(screen.getByText("Now").classList.contains("page-extra")).toBe(true);
  });
});
