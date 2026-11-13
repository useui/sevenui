import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/registry/base/ui/avatar";

import { isUiSdk } from "./helpers/flavour";

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
    const image = screen.queryByAltText("Ada Lovelace");
    if (isUiSdk) {
      // UI SDK renders the <img> at once so it can load before hydration,
      // hidden from assistive tech until it loads.
      expect(image?.getAttribute("aria-hidden")).toBe("true");
    } else {
      expect(image).toBeNull();
    }
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
    if (isUiSdk) {
      // UI SDK watches the rendered <img>, not a preloading Image object.
      const image = screen.getByAltText("Ada Lovelace");
      Object.defineProperty(image, "complete", { value: true });
      Object.defineProperty(image, "naturalWidth", { value: 128 });
      fireEvent.load(image);
    }
    expect(screen.getByAltText("Ada Lovelace")).not.toBeNull();
    expect(screen.queryByText("AL")).toBeNull();
  });

  it("marks the first frame of a loaded image with data-starting-style", async () => {
    window.Image = LoadedImage as unknown as typeof Image;
    render(
      <Avatar>
        <AvatarImage src="https://example.com/a.png" alt="Ada Lovelace" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    );
    if (isUiSdk) {
      const image = screen.getByAltText("Ada Lovelace");
      expect(image.hasAttribute("data-starting-style")).toBe(false);
      Object.defineProperty(image, "complete", { value: true });
      Object.defineProperty(image, "naturalWidth", { value: 128 });
      fireEvent.load(image);
    }
    // A transition from data-[starting-style]:opacity-0 fades the image in.
    const image = screen.getByAltText("Ada Lovelace");
    expect(image.hasAttribute("data-starting-style")).toBe(true);
    await waitFor(() => expect(image.hasAttribute("data-starting-style")).toBe(false));
  });

  it("delays fallback rendering when a delay is set", async () => {
    vi.useFakeTimers();
    render(
      <Avatar>
        <AvatarImage src="https://example.com/a.png" alt="Ada" />
        <AvatarFallback delay={300}>AL</AvatarFallback>
      </Avatar>,
    );
    expect(screen.queryByText("AL")).toBeNull();
    // UI SDK's delay timer is not reached by a synchronous advance; the
    // async advance flushes pending work between timers in both flavours.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
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
