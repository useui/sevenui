"use client";

import * as React from "react";
import { FLAVOUR_LABELS, FLAVOURS, type Flavour, setFlavour } from "../../lib/flavour";
import { useFlavour } from "./use-flavour";

/**
 * The site-wide primitive flavour control: a two-option segmented switch in the LayerCard tab vocabulary.
 * The selected look comes from `<html data-flavour>` in CSS (`.flavour-switch` in globals.css), so it is
 * right at first paint; `aria-checked` follows once React knows the stored choice.
 */
export function FlavourSwitch({ className = "", id }: { className?: string; id?: string }) {
  const flavour = useFlavour();
  const refs = React.useRef<Partial<Record<Flavour, HTMLButtonElement | null>>>({});

  function choose(next: Flavour, focus = false) {
    if (next !== flavour) setFlavour(next);
    if (focus) refs.current[next]?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const at = FLAVOURS.indexOf(flavour);
    let next: number;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (at + 1) % FLAVOURS.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (at - 1 + FLAVOURS.length) % FLAVOURS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = FLAVOURS.length - 1;
    else return;
    event.preventDefault();
    choose(FLAVOURS[next], true);
  }

  return (
    <div
      aria-label="Primitive flavour"
      className={`flavour-switch inline-flex shrink-0 items-center gap-0.5 rounded-lg p-0.5 font-medium text-xs ${className}`}
      id={id}
      onKeyDown={onKeyDown}
      role="radiogroup"
    >
      {FLAVOURS.map((option) => (
        // biome-ignore lint/a11y/useSemanticElements: a segmented switch drawn like the tabs; roving focus is handled above
        <button
          aria-checked={flavour === option}
          className="flavour-switch-option cursor-pointer whitespace-nowrap rounded-md px-2 py-1 text-muted-foreground outline-none transition-[color,background-color,box-shadow] hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-1 focus-visible:outline-ring motion-reduce:transition-none"
          data-option={option}
          key={option}
          onClick={() => choose(option)}
          ref={(node) => {
            refs.current[option] = node;
          }}
          role="radio"
          tabIndex={flavour === option ? 0 : -1}
          type="button"
        >
          {FLAVOUR_LABELS[option]}
        </button>
      ))}
    </div>
  );
}
