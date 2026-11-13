import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DirectionProvider, useDirection } from "@/registry/base/ui/direction";
import { isUiSdk } from "./helpers/flavour";

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
    if (isUiSdk) {
      // UI SDK reads direction from the page, so the flavour's provider sets
      // dir on a display: contents wrapper, which adds no box. After the
      // children it holds the host its popups render into (also no box), so
      // they keep the dir.
      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.getAttribute("dir")).toBe("rtl");
      expect(wrapper.style.display).toBe("contents");
      expect(wrapper.children).toHaveLength(2);
      expect(wrapper.firstElementChild).toBe(screen.getByTestId("only-child"));
      const host = wrapper.lastElementChild as HTMLElement;
      expect(host.getAttribute("data-slot")).toBe("direction-popups");
      expect(host.style.display).toBe("contents");
      expect(host.children).toHaveLength(0);
      return;
    }
    expect(container.firstElementChild).toBe(
      screen.getByTestId("only-child"),
    );
  });
});
