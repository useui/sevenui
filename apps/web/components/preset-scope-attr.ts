// A plain module — deliberately carrying NO `"use client"` directive — so
// this constant is a real, importable string from both a Server Component
// (`components/demo/preview-pane.tsx`) and a Client Component
// (`components/preset-scope.tsx`).
//
// The fact this file exists to route around, recorded because the next
// author will hit it somewhere else: every export of a `"use client"`
// module becomes a client-reference STUB when a Server Component imports
// it — string constants included, not only components and functions.
// `PRESET_SCOPE_ATTR` used to be declared inside `preset-scope.tsx` (a
// `"use client"` file). Imported from `preview-pane.tsx` (a Server
// Component), that constant was not a string on the server — it was a
// stub function that throws if actually invoked — and
// `{...{ [PRESET_SCOPE_ATTR]: "" }}` silently computed a garbage property
// key from that stub instead of throwing, so React dropped the resulting
// attribute with no error anywhere. Confirmed two ways: probing the
// server-rendered value directly showed
// `typeof PRESET_SCOPE_ATTR === "function"`, one that throws
// `"Attempted to call PRESET_SCOPE_ATTR() from the server but
// PRESET_SCOPE_ATTR is on the client"`; and reproducing the exact same
// spread with a LOCAL const (no client boundary in between) rendered the
// attribute correctly in the same build. The spread syntax itself was
// never the problem — crossing the client boundary for a plain value was.
export const PRESET_SCOPE_ATTR = "data-preset-scope";
