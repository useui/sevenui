import { render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import registry from "../registry.json";

type Css = Record<string, string | Record<string, string>>;
const tokens = registry.items.find((i) => i.name === "sevenui-tokens");
const css: Css = (tokens?.css ?? {}) as unknown as Css;

function cssText(): string {
  return Object.entries(css)
    .filter(([sel, v]) => !sel.startsWith("@") && typeof v === "object")
    .map(
      ([sel, decls]) =>
        `${sel} { ${Object.entries(decls as Record<string, string>)
          .map(([k, v]) => `${k}: ${v};`)
          .join(" ")} }`,
    )
    .join("\n");
}

let style: HTMLStyleElement | undefined;
function inject() {
  style = document.createElement("style");
  style.textContent = cssText();
  document.head.appendChild(style);
}
afterEach(() => style?.remove());

function setup() {
  const view = render(
    <>
      <div data-density="compact">
        <span data-testid="a" />
      </div>
      <span data-testid="b" />
    </>,
  );
  return {
    a: view.getByTestId("a"),
    b: view.getByTestId("b"),
  };
}

describe("density scoping", () => {
  it("resolves --control-h via getComputedStyle: compact inside scope, default outside", () => {
    inject();
    const { a, b } = setup();
    expect(getComputedStyle(a).getPropertyValue("--control-h").trim()).toBe("1.75rem");
    expect(getComputedStyle(b).getPropertyValue("--control-h").trim()).toBe("2.125rem");
  });
});
