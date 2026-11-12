"use client";

import * as React from "react";

type TextDirection = "ltr" | "rtl";

const DirectionContext = React.createContext<TextDirection>("ltr");

// UI SDK reads direction from the page (computed `direction`), not from React
// context, so the provider also sets `dir` on a `display: contents` wrapper.
// The wrapper adds no box; without a `direction` prop it sets no `dir`, so the
// page's own direction still applies to the DOM.
function DirectionProvider({
  direction,
  children,
}: {
  direction?: TextDirection;
  children?: React.ReactNode;
}) {
  return (
    <DirectionContext.Provider value={direction ?? "ltr"}>
      <div dir={direction} style={{ display: "contents" }}>
        {children}
      </div>
    </DirectionContext.Provider>
  );
}

function useDirection(): TextDirection {
  return React.useContext(DirectionContext);
}

export { DirectionProvider, useDirection };
