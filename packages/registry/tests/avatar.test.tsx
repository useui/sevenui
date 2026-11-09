import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/registry/base/ui/avatar";

/**
 * jsdom never fires load events for images created via `new window.Image()`,
 * so Base UI's loading status stays at "loading" and the fallback renders.
 * To exercise the "loaded" path we swap in a fake Image whose `complete`
 * fast-path reports a decoded image synchronously.
 */
class LoadedImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  complete = true;
  naturalWidth = 128;
  crossOrigin: string | null = null;
  referrerPolicy = "";
  sizes = "";
  srcset = "";
  src = "";
}

const RealImage = window.Image;

afterEach(() => {
  window.Image = RealImage;
  vi.useRealTimers();
});

describe("Avatar", () => {
  it("renders the fallback while the image never loads in jsdom", () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/a.png" alt="Ada Lovelace" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText("AL")).not.toBeNull();
    expect(screen.queryByAltText("Ada Lovelace")).toBeNull();
  });

  it("renders the fallback when no image is provided", () => {
    render(
      <Avatar>
        <AvatarFallback>NB</AvatarFallback>
      </Avatar>,
    );
    const fallback = screen.getByText("NB");
    expect(fallback.getAttribute("data-slot")).toBe("avatar-fallback");
  });

  it("shows the image and hides the fallback once loading succeeds", () => {
    window.Image = LoadedImage as unknown as typeof Image;
    render(
      <Avatar>
        <AvatarImage src="https://example.com/a.png" alt="Ada Lovelace" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByAltText("Ada Lovelace")).not.toBeNull();
    expect(screen.queryByText("AL")).toBeNull();
  });

  it("delays fallback rendering when a delay is set", () => {
    vi.useFakeTimers();
    render(
      <Avatar>
        <AvatarImage src="https://example.com/a.png" alt="Ada" />
        <AvatarFallback delay={300}>AL</AvatarFallback>
      </Avatar>,
    );
    expect(screen.queryByText("AL")).toBeNull();
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText("AL")).not.toBeNull();
  });

  it("defaults to size 'default' and reflects the size prop as data-size", () => {
    const { rerender } = render(
      <Avatar data-testid="avatar">
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByTestId("avatar").getAttribute("data-size")).toBe(
      "default",
    );
    rerender(
      <Avatar data-testid="avatar" size="sm">
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByTestId("avatar").getAttribute("data-size")).toBe("sm");
    rerender(
      <Avatar data-testid="avatar" size="lg">
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByTestId("avatar").getAttribute("data-size")).toBe("lg");
  });

  it("appends custom className on root, image and fallback", () => {
    window.Image = LoadedImage as unknown as typeof Image;
    render(
      <Avatar data-testid="avatar" className="root-extra">
        <AvatarImage
          src="https://example.com/a.png"
          alt="Ada"
          className="image-extra"
        />
      </Avatar>,
    );
    render(
      <Avatar>
        <AvatarFallback className="fallback-extra">AL</AvatarFallback>
      </Avatar>,
    );
    expect(
      screen.getByTestId("avatar").classList.contains("root-extra"),
    ).toBe(true);
    expect(
      screen.getByAltText("Ada").classList.contains("image-extra"),
    ).toBe(true);
    expect(screen.getByText("AL").classList.contains("fallback-extra")).toBe(
      true,
    );
  });
});

describe("AvatarBadge", () => {
  it("renders a status badge inside the avatar", () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarFallback>AL</AvatarFallback>
        <AvatarBadge data-testid="badge" className="badge-extra" />
      </Avatar>,
    );
    const badge = screen.getByTestId("badge");
    expect(badge.getAttribute("data-slot")).toBe("avatar-badge");
    expect(badge.classList.contains("badge-extra")).toBe(true);
    expect(screen.getByTestId("avatar").contains(badge)).toBe(true);
  });
});

describe("AvatarGroup", () => {
  it("groups avatars and renders an overflow count", () => {
    render(
      <AvatarGroup data-testid="group">
        <Avatar>
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>GH</AvatarFallback>
        </Avatar>
        <AvatarGroupCount data-testid="count">+3</AvatarGroupCount>
      </AvatarGroup>,
    );
    const group = screen.getByTestId("group");
    expect(group.getAttribute("data-slot")).toBe("avatar-group");
    expect(group.querySelectorAll('[data-slot="avatar"]')).toHaveLength(2);
    const count = screen.getByTestId("count");
    expect(count.getAttribute("data-slot")).toBe("avatar-group-count");
    expect(count.textContent).toBe("+3");
  });
});

describe("Avatar v2 design language", () => {
  it("draws an inner border over the image with a blend mode", () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    );
    const cls = screen.getByTestId("avatar").className;
    expect(cls).toContain("after:border-border");
    expect(cls).toContain("after:mix-blend-darken");
    expect(cls).toContain("dark:after:mix-blend-lighten");
    expect(cls).not.toContain("hairline");
  });

  it("sets the fallback and the overflow count on the muted surface", () => {
    render(
      <AvatarGroup>
        <Avatar>
          <AvatarFallback data-testid="fallback">AL</AvatarFallback>
        </Avatar>
        <AvatarGroupCount data-testid="count">+3</AvatarGroupCount>
      </AvatarGroup>,
    );
    for (const id of ["fallback", "count"]) {
      const classes = screen.getByTestId(id).className.split(" ");
      expect(classes).toContain("bg-muted");
      expect(classes).toContain("text-muted-foreground");
      expect(classes.join(" ")).not.toContain("surface");
      expect(classes.join(" ")).not.toContain("hairline");
    }
  });
});
