"use client";

import * as React from "react";

type TextDirection = "ltr" | "rtl";

const DirectionContext = React.createContext<TextDirection>("ltr");

// Where the popups inside a provider render, shared with the popup files
// through a global symbol (as form.tsx and field.tsx share theirs): `null`
// outside any provider with a direction (<body>), else this provider's host
// (in place until the host mounts).
type PopupHost = { host: HTMLElement | null } | null;
const popupHostKey = Symbol.for("sevenui.ui-sdk.popup-host");
const popupHosts = globalThis as { [key: symbol]: React.Context<PopupHost> | undefined };
popupHosts[popupHostKey] ??= React.createContext<PopupHost>(null);
const PopupHostContext = popupHosts[popupHostKey] as React.Context<PopupHost>;

// UI SDK reads direction from the page (computed `direction`), not from React
// context, so the provider also sets `dir` on a `display: contents` wrapper.
// The wrapper adds no box; without a `direction` prop it sets no `dir`, so the
// page's own direction still applies to the DOM. Popups render outside the
// trigger's parents (into <body>), which would lose that `dir`, so a provider
// with a direction gives them a host inside its wrapper, after the children.
function DirectionProvider({
  direction,
  children,
}: {
  direction?: TextDirection;
  children?: React.ReactNode;
}) {
  const outer = React.useContext(PopupHostContext);
  const [host, setHost] = React.useState<HTMLElement | null>(null);
  const scope = React.useMemo(() => (direction ? { host } : outer), [direction, host, outer]);
  return (
    <DirectionContext.Provider value={direction ?? "ltr"}>
      <div dir={direction} style={{ display: "contents" }}>
        <PopupHostContext.Provider value={scope}>{children}</PopupHostContext.Provider>
        {direction && <div data-slot="direction-popups" ref={setHost} style={{ display: "contents" }} />}
      </div>
    </DirectionContext.Provider>
  );
}

function useDirection(): TextDirection {
  return React.useContext(DirectionContext);
}

export { DirectionProvider, useDirection };
