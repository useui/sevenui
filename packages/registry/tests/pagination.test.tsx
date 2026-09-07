import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/registry/base/ui/pagination";

function Pager({ activePage = 2 }: { activePage?: number }) {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#page-1" />
        </PaginationItem>
        {[1, 2, 3].map((page) => (
          <PaginationItem key={page}>
            <PaginationLink href={`#page-${page}`} isActive={page === activePage}>
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#page-3" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

describe("Pagination", () => {
  it("renders a nav landmark labeled 'pagination' with a list of items", () => {
    render(<Pager />);
    const nav = screen.getByRole("navigation", { name: "pagination" });
    expect(nav.getAttribute("data-slot")).toBe("pagination");
    expect(screen.getAllByRole("listitem")).toHaveLength(6);
  });

  it("renders page links as real links", () => {
    render(<Pager />);
    const page1 = screen.getByRole("link", { name: "1" });
    expect(page1.tagName).toBe("A");
    expect(page1.getAttribute("href")).toBe("#page-1");
    expect(page1.getAttribute("data-slot")).toBe("pagination-link");
  });

  it("marks only the active page with aria-current='page'", () => {
    render(<Pager activePage={2} />);
    const active = screen.getByRole("link", { name: "2" });
    expect(active.getAttribute("aria-current")).toBe("page");
    expect(active.getAttribute("data-active")).toBe("true");
    const inactive = screen.getByRole("link", { name: "1" });
    expect(inactive.getAttribute("aria-current")).toBeNull();
    // data-active is present only on the active page — an explicit
    // isActive={false} must not serialize as data-active="false".
    expect(inactive.getAttribute("data-active")).toBeNull();
  });

  it("styles the active page as outline and inactive pages as ghost", () => {
    render(<Pager activePage={2} />);
    // "bg-background" is a distinguishing token of the outline button variant.
    expect(
      screen.getByRole("link", { name: "2" }).classList.contains(
        "bg-background",
      ),
    ).toBe(true);
    expect(
      screen.getByRole("link", { name: "1" }).classList.contains(
        "bg-background",
      ),
    ).toBe(false);
  });

  it("labels previous and next controls for screen readers", () => {
    render(<Pager />);
    const previous = screen.getByRole("link", { name: "Go to previous page" });
    expect(previous.getAttribute("href")).toBe("#page-1");
    expect(previous.textContent).toContain("Previous");
    const next = screen.getByRole("link", { name: "Go to next page" });
    expect(next.getAttribute("href")).toBe("#page-3");
    expect(next.textContent).toContain("Next");
  });

  it("supports custom previous/next text", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" text="Back" />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" text="Forward" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    expect(screen.getByText("Back")).not.toBeNull();
    expect(screen.getByText("Forward")).not.toBeNull();
  });

  it("propagates disabled semantics onto previous/next anchors", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#page-1"
              aria-disabled="true"
              data-testid="previous"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    expect(screen.getByTestId("previous").getAttribute("aria-disabled")).toBe(
      "true",
    );
  });

  it("hides the ellipsis from assistive tech while keeping sr-only text", () => {
    const { container } = render(<PaginationEllipsis className="dots-extra" />);
    const ellipsis = container.querySelector(
      '[data-slot="pagination-ellipsis"]',
    ) as HTMLElement;
    expect(ellipsis.getAttribute("aria-hidden")).toBe("true");
    expect(ellipsis.classList.contains("dots-extra")).toBe(true);
    const srOnly = screen.getByText("More pages");
    expect(srOnly.classList.contains("sr-only")).toBe(true);
  });

  it("appends custom className on nav, content and links", () => {
    render(
      <Pagination className="nav-extra">
        <PaginationContent className="content-extra">
          <PaginationItem>
            <PaginationLink href="#" className="link-extra">
              1
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    expect(
      screen.getByRole("navigation").classList.contains("nav-extra"),
    ).toBe(true);
    expect(screen.getByRole("list").classList.contains("content-extra")).toBe(
      true,
    );
    expect(
      screen.getByRole("link", { name: "1" }).classList.contains(
        "link-extra",
      ),
    ).toBe(true);
  });
});
