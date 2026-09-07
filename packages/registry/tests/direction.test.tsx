import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DirectionProvider, useDirection } from "@/registry/base/ui/direction";

function ShowDirection({ id = "direction" }: { id?: string }) {
  const direction = useDirection();
  return <span data-testid={id}>{direction}</span>;
}

describe("DirectionProvider", () => {
  it("defaults to 'ltr' when no provider is present", () => {
    render(<ShowDirection />);
    expect(screen.getByTestId("direction").textContent).toBe("ltr");
  });

  it("defaults to 'ltr' when the provider has no direction prop", () => {
    render(
      <DirectionProvider>
        <ShowDirection />
      </DirectionProvider>,
    );
    expect(screen.getByTestId("direction").textContent).toBe("ltr");
  });

  it("propagates 'rtl' to descendants", () => {
    render(
      <DirectionProvider direction="rtl">
        <div>
          <ShowDirection />
        </div>
      </DirectionProvider>,
    );
    expect(screen.getByTestId("direction").textContent).toBe("rtl");
  });

  it("lets a nested provider override the outer direction", () => {
    render(
      <DirectionProvider direction="rtl">
        <ShowDirection id="outer" />
        <DirectionProvider direction="ltr">
          <ShowDirection id="inner" />
        </DirectionProvider>
      </DirectionProvider>,
    );
    expect(screen.getByTestId("outer").textContent).toBe("rtl");
    expect(screen.getByTestId("inner").textContent).toBe("ltr");
  });

  it("adds no wrapper element around its children", () => {
    const { container } = render(
      <DirectionProvider direction="rtl">
        <span data-testid="only-child">content</span>
      </DirectionProvider>,
    );
    expect(container.children).toHaveLength(1);
    expect(container.firstElementChild).toBe(
      screen.getByTestId("only-child"),
    );
  });
});
