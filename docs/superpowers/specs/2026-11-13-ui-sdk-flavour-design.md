# SevenUI — UI SDK as a second primitive flavour

**Date:** 2026-11-13
**Status:** All 66 primitives are ported and published in the flavour on `feat/ui-sdk` (`node scripts/ui-sdk-flavour.mjs status --strict` exits 0). The whole tree was verified together after the parallel ports (2026-11-13).
**Companions:**
- ADR: `docs/adr/0002-ui-sdk-second-flavour.md`
- Porter's manual: `docs/superpowers/plans/2026-11-13-ui-sdk-porting-guide.md` (it holds the verified mapping, the adapter patterns and the divergence table)

## 1. Goal

Every SevenUI primitive also exists in a flavour built on UI SDK. The user picks a flavour per install:
- `npx shadcn add @sevenui/button` installs the Base UI flavour;
- `npx shadcn add @sevenui/ui-sdk/button` installs the UI SDK flavour.

UI SDK is published by Vercel Labs as `@ui-sdk/react` + `@ui-sdk/core` 0.1.0-beta.1. It is React 19 only.

The existing Base UI output is untouched: `/r/*.json`, `/r/demo/*.json` and `/r/component/*.json` stay byte-identical.

## 2. Decisions

| # | Decision | As built |
|---|---|---|
| 1 | Source tree `packages/registry/registry/ui-sdk/ui/<name>.tsx` (+ `hooks/`), sibling of `registry/base/`. | As decided. Imports use `@/registry/ui-sdk/ui/<x>`. The shadcn CLI's `@/registry/(.+)/ui` rewrite handles the `ui-sdk` segment exactly as it handles `base`; the smoke test proves it. |
| 2 | Separate flavour registry, built to `apps/web/public/r/ui-sdk/<name>.json` by an extra `shadcn build` in `build:registry`. Item names stay plain (`button`). | As decided. The registry file is `packages/registry/registry.ui-sdk.json`, built with `shadcn build registry.ui-sdk.json -c ../../packages/registry -o ../../apps/web/public/r/ui-sdk`. The registry argument resolves against `-c`. **Changed:** the file is **generated at build time and git-ignored**, not committed (§3). |
| 3 | Closed dependency graph. Flavour items depend on `/r/ui-sdk/<x>.json`; `theme`, `sevenui-tokens` and `animations` are shared, not duplicated. | As decided. A ported item whose dependency is not ported yet is **blocked**: it stays out of the published registry, so the graph is always closed. |
| 4 | Porters touch only their own file; ported state must not live in a shared list. | Ported state is detected from the file (§3). The generator derives titles, descriptions, npm dependencies (from the file's real imports) and registryDependencies. |
| 5 | Same public API across flavours: export names, props, `data-slot` values, `render`. | As decided. Adapters are documented in the guide §4, divergences in its §8. Export names are enforced by `tests/api-freeze.test.ts`. |
| 6 | ~~Third-party wrappers stay as they are.~~ | **Reversed by the user (2026-11-13):** where UI SDK ships a component, the flavour uses it. `calendar` → `@ui-sdk/react/calendar`, `carousel` → `@ui-sdk/react/carousel`, `resizable` → `@ui-sdk/react/resizable`. `chart` keeps `recharts`, and `message-scroller`/`questionnaire` keep `@shadcn/react` (no UI SDK equivalent). The three replaced primitives get no seed copy. Their API is still under discussion; the guide's §9 has the evidence. `label`, `textarea` and `input-group` also have UI SDK components; **decided (2026-11-13):** the flavour builds them on UI SDK `Label`, `Textarea` and `InputGroup` with the base API kept, and the generator treats them as real ports (`UI_SDK_PORTS`). `pagination` stays a mirror: UI SDK's is stateful and cannot keep the base API (guide §9.4). |
| 7 | `@ui-sdk/react` and `@ui-sdk/core` pinned exactly in `packages/registry/package.json`; items declare the exact version. | As decided. pnpm also added both to `minimumReleaseAgeExclude` in `pnpm-workspace.yaml`. A consumer's npm saves the exact spec with a caret (`^0.1.0-beta.1`); for a prerelease that still admits only `0.1.0` prereleases and `0.1.x`. |
| 8 | The suite runs a second time against the flavour. | As decided. There is a `ui-sdk` vitest project with its own setup file and an alias of `@/registry/base/ui` → `registry/ui-sdk/ui`. It runs a test file once every primitive it imports is ported. |
| 9 | Guards in `check-registry` and the smoke test. | As decided (§5). |
| 10 | Deliver `@layer ui-sdk;` to consumers. | shadcn cannot place it (§4). It is a printed manual step plus the docs site's `globals.css`. |

## 3. What a primitive's state is, and why it is not a list

A shared `PENDING` list would be edited by every porter, so the state is read from the files instead. The generator is `scripts/ui-sdk-flavour.mjs`; the definitions of each state are in the guide's §1.

| State | Rule |
|---|---|
| pending | The file is the untouched seed, or absent for a primitive with no seed. |
| ported | The file imports nothing in `REPLACED` (`@base-ui/react`, `react-day-picker`, `embla-carousel-react`, `react-resizable-panels`). |
| mirror | A ported file whose base imports nothing in `REPLACED`. It must stay byte-identical to its retargeted base, unless the primitive is in `UI_SDK_PORTS` (`label`, `textarea`, `input-group`), whose file must import `@ui-sdk/react`. |
| blocked | Ported, but it depends on an item that is not ported. |

The 43 unfinished Base UI primitives keep **seeds**: exact retargeted copies of their base file. With seeds, every flavour import resolves and the tree typechecks. A seed is never published and never counted as ported. An *edited* seed that still imports Base UI fails the check, so a half-port cannot slip through.

The generated registry is **not committed**. Every port changes it: a new item, new dependencies. A committed copy would therefore be the one file all porters edit, which is the contention this design exists to avoid. Instead:
- `build:registry` runs `node scripts/ui-sdk-flavour.mjs build` before the flavour's `shadcn build`;
- `check-registry` validates the same derived registry in memory.

The finish line is `node scripts/ui-sdk-flavour.mjs status --strict`, which exits 1 while anything is pending or blocked.

## 4. The cascade layer

UI SDK puts a slot-keyed popover reset (`inset`, `padding`, `background`, …) into `@layer ui-sdk`. If that layer is ordered after Tailwind's, it beats every utility on top-layer parts.

Verified in Chrome on a throwaway route rendering the flavour dialog:
1. With `@layer ui-sdk` ordered last, the open dialog computed `padding: 0px`, a transparent background and `top: 0px`.
2. With `@layer ui-sdk;` first in `globals.css`, the same forced late injection computed `padding: 18px`, `bg-popover` and a centred `top`.
3. UI SDK prepends its `<style>` elements to `<head>`, so without the declaration a plain page happened to work. The declaration is what makes it robust: constructed sheets under CSP, late injection, SSR ordering.

**Delivery.** shadcn's registry `css` field can only append to the consumer's CSS file. `"@layer ui-sdk": {}` lands as a `@layer ui-sdk;` statement at the end, after `@import "tailwindcss"`, which is too late to order layers; with the line already on top it is deduplicated. Both were checked in a scratch project.

So:
- each flavour item that imports UI SDK carries a `docs` string, which `shadcn add` prints after install;
- the docs site declares the layer in `apps/web/app/globals.css`.

The message prints once per installed item. That is noisy, but there is no per-install hook.

## 5. Guards

**`scripts/check-registry.mjs`.** On top of the generator's problems listed in §3, it checks that:
- every `.ts`/`.tsx` file under `registry/ui-sdk` belongs to a primitive;
- every base primitive is ported, blocked or pending;
- published flavour items are base primitives with files under `registry/ui-sdk/` and no replaced import or dependency;
- flavour registryDependencies are `/r/ui-sdk/<x>.json` of a published item, or a shared item;
- `sevenui-tokens` is present;
- lucide and npm ranges match `packages/registry/package.json`.

Each failure mode was positive-controlled: an edited seed, a drifted mirror, a react-day-picker seed and a stray file each produced their error.

**`tests/api-freeze.test.ts`.** A ported flavour file must export exactly the base file's names.

**`scripts/smoke-test.sh`.** A fresh consumer project with `@layer ui-sdk;` on line 1 installs `ui-sdk/{dialog,dropdown-menu,select,tooltip,checkbox,badge}`. It asserts that:
- the files land in the `ui` alias, and dialog pulls the flavour button;
- imports are rewritten;
- `@ui-sdk/*` 0.1.0-beta.1 is in `package.json` and `@base-ui/react` is not;
- `sevenui-tokens` arrives;
- line 1 is still the layer declaration;
- the layer step is printed;
- base-flavour JSX typechecks against the flavour, including Base UI-only props such as `closeOnClick`, `indeterminate`, `items`, `side="inline-end"` and `TooltipTrigger delay`.

**The smoke test passes**, flavour block included. It used to exit 1 on an older assertion that `--surface-tray:` is declared exactly twice after `select`+`dialog`. That count broke when the token probe moved from `--brand` to `--surface-tray` (`e35a034`): shadcn 4.19.1 does not read a `color-mix()` value as a colour, so the first install already writes a third, pass-through `--surface-tray: var(--surface-tray);` into `@theme inline`. The second install never duplicated anything. The assertion now counts the two theme-block declarations and checks that the second install adds no match.

**`scripts/check-ui-sdk-compat.mjs`** (`pnpm check:ui-sdk-compat`). It typechecks all 1,063 demos and gallery examples as a project that installed the flavour sees them: `@/registry/base/ui/*` resolves to the flavour, and the four replaced libraries are not installed. Two controls keep it honest: a file importing `@base-ui/react/tabs` must be reported, and a type that only the flavour calendar exports must resolve. The result, `packages/registry/ui-sdk-compat.json`, classifies each example as `ok`, `differs` or `needs-variant`. The check fails when the manifest is stale.

## 6. Byte parity

`apps/web/public/r` was built at `e7024e6` (before any flavour work) and at the tip, and compared with `diff -r`. The only difference is the new `r/ui-sdk/` directory: 66 items plus `registry.json`. The other 1,135 files under `r/`, `r/demo/` and `r/component/` are byte-identical.

## 7. Pilots

The pilot ports are `button`, `badge`, `checkbox`, `dialog`, `select`, `dropdown-menu` and `tooltip`. Their tests are green in both flavours. They cover:
- the `useRender` → `renderElement` pattern;
- the hidden-input form control;
- the Portal collapse;
- the `SelectLabel` clash;
- submenus and indicators;
- a provider that disappears.

Things found on the way, each with its fix, are in the guide:
- the `data-slot` override and the slot-keyed reset;
- Select `items` overriding rendered items;
- trigger `data-popup-open`;
- hover-close and focus timing in jsdom.

## 8. Tests

| Run | Result | What changed |
|---|---|---|
| `base` project | 1,013 tests, 71 files | The original tests pass unchanged; the additions are export-freeze checks for every ported file and tests added with the ports. |
| `ui-sdk` project | 865 tests + 1 expected failure, 66 files | The expected failure is the input-otp paste test (`it.fails`): a UI SDK 0.1.0-beta.1 bug, see the guide's §8. |

Flavour-specific expectations live in `tests/helpers/flavour.ts`. Each states why it exists.

## 9. Open items

- **13 examples need a flavour variant**, and 69 typecheck but hit a recorded difference: see `packages/registry/ui-sdk-compat.json`.
- **Examples are not flavoured.** `/r/demo/*` and `/r/component/*` declare `registryDependencies` on base URLs, so installing an example into a UI SDK project pulls the Base UI primitive over the flavour one. The example source itself works against either flavour, which is the point of decision 5. Options:
  - generate flavoured example registries (`/r/ui-sdk/demo/*`) by retargeting registryDependencies at build time;
  - document "install the primitives first".
- **The site does not render the flavour anywhere yet.** There is no flavour switch in the docs. `apps/web` would also need `@ui-sdk/*` as dependencies to render it in production; the throwaway route resolved them from `packages/registry`.
- The API decision for calendar, carousel and resizable (guide §9).
