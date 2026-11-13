"use client";

import * as React from "react";
import { DEFAULT_FLAVOUR, FLAVOUR_LABELS, FLAVOURS, type Flavour, setFlavour } from "../../lib/flavour";
import { TOOLBAR_SEGMENT_RADIUS } from "../toolbar-classes";
import { useFlavour } from "./use-flavour";

const OPTION =
  `flavour-switch-option inline-flex cursor-pointer items-center whitespace-nowrap ${TOOLBAR_SEGMENT_RADIUS} px-2 py-1 text-foreground/60 outline-none transition-[color,background-color,box-shadow] hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-1 focus-visible:outline-ring motion-reduce:transition-none`;

/**
 * The site-wide primitive flavour control: a two-option segmented switch in the LayerCard tab vocabulary.
 * The selected look comes from `<html data-flavour>` in CSS (`.flavour-switch` in globals.css), so it is
 * right at first paint; `aria-checked` follows once React knows the stored choice.
 *
 * The page has one real control, in the sidebar (also inside the menu drawer on narrow screens). Copies
 * next to an example or an install command are `mirror`s: a pointer shortcut to the same setting, left out
 * of the tab order and the accessibility tree, so a gallery page does not offer a keyboard or screen-reader
 * user a dozen identical radio groups.
 */
export function FlavourSwitch({ className = "", id, mirror = false }: { className?: string; id?: string; mirror?: boolean }) {
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

  const group = `flavour-switch inline-flex min-h-(--toolbar-h) shrink-0 items-stretch gap-0.5 rounded-[var(--toolbar-radius,var(--radius-lg))] p-0.5 font-medium text-xs ${className}`;

  if (mirror) {
    return (
      <div aria-hidden="true" className={group} id={id}>
        {FLAVOURS.map((option) => (
          <button
            className={OPTION}
            data-option={option}
            key={option}
            onClick={() => choose(option)}
            // A mirror takes no focus, so a click never strands focus inside an aria-hidden control.
            onMouseDown={(event) => event.preventDefault()}
            tabIndex={-1}
            type="button"
          >
            {FLAVOUR_LABELS[option]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Shown only without scripts (globals.css), when the page is in the default flavour and cannot switch. */}
      <span className="flavour-switch-static font-medium text-foreground text-xs" title="Turn on JavaScript to switch to UI SDK">
        {FLAVOUR_LABELS[DEFAULT_FLAVOUR]}
      </span>
      <div aria-label="Primitive flavour" className={group} id={id} onKeyDown={onKeyDown} role="radiogroup">
      {FLAVOURS.map((option) => (
        // biome-ignore lint/a11y/useSemanticElements: a segmented switch drawn like the tabs; roving focus is handled above
        <button
          aria-checked={flavour === option}
          className={OPTION}
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
    </>
  );
}
