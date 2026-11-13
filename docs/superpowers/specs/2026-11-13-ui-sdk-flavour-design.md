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

Every demo and gallery example is published in the flavour as well: `npx shadcn add @sevenui/ui-sdk/demo/<name>` and `@sevenui/ui-sdk/component/<name>` (§10).

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
| 7 | `@ui-sdk/react` and `@ui-sdk/core` pinned exactly in `packages/registry/package.json`; items declare the exact version. | As decided, and enforced: `check-registry` rejects a range operator on `@ui-sdk/*` in the root, registry and site `package.json` and in every published flavour item and example, and the smoke test checks the served items and the version that lands in `node_modules`. pnpm also added both to `minimumReleaseAgeExclude` in `pnpm-workspace.yaml`. For consumers the registry can only ask: the CLI passes the spec to the package manager with no exact flag. Checked on 2026-11-13: pnpm 11, yarn 1 and bun 1 save `0.1.0-beta.1` as given; npm 11 saves `^0.1.0-beta.1`, which admits every later `0.1.0` beta and `0.1.x` release. The install message, the installation guide and each primitive page say so and give the npm fix (`save-exact=true` in `.npmrc` before installing, or `npm install --save-exact` after). |
| 8 | The suite runs a second time against the flavour. | As decided. There is a `ui-sdk` vitest project with its own setup file and an alias of `@/registry/base/ui` → `registry/ui-sdk/ui`. It runs every test file that imports a primitive; with every primitive ported, `vitest.config.ts` fails rather than drop a file whose primitive stops counting as ported, and the export-freeze test asserts every primitive is ported. Both use the generator's one ported rule (`importsReplaced`). |
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

While porting was under way, unfinished Base UI primitives kept **seeds**: exact retargeted copies of their base file, so every flavour import resolved and the tree typechecked. A seed was never published and never counted as ported, and an *edited* seed that still imported Base UI failed the check. Every primitive is ported now and no seed remains.

A half-port cannot slip through: a flavour file that names a replaced library in any import form (`import … from`, `import type`, `export … from`, a side-effect `import`, a dynamic `import()` with a string or template literal, `typeof import()`, `require()`, `import x = require()`, a `/// <reference types>`) is not ported, and `check-registry` requires the published flavour to equal the base set with nothing pending or blocked. Prose in a comment such as "from \`items\`" is not read as an import.

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
- a `docs` string, which `shadcn add` prints after install, carried by one flavour-only item, `ui-sdk-setup` (no files), that every flavour item importing UI SDK depends on;
- the docs site declares the layer in `apps/web/app/globals.css`.

The CLI prints `docs` once for every item it resolves, dependencies included: with the message on each item, a six-item install printed it nine times and all 66 primitives 62 times. On the shared item it prints once per install (checked with shadcn: dialog, select and tooltip printed it four times before, once after). The message says when the line matters: UI SDK normally prepends its styles, so a default Next.js build behaves the same without it (the end-to-end tester saw 11 popups identical), and the line protects the cases in item 3 above. It also states the tested version and how to pin it with npm.

## 5. Guards

**`scripts/check-registry.mjs`.** On top of the generator's problems listed in §3, it checks that:
- every `.ts`/`.tsx` file under `registry/ui-sdk` belongs to a primitive;
- the published flavour equals the base primitive set, with nothing pending or blocked (compared with the root registry, not the generator's own state);
- the stray-file walk saw every registered flavour file;
- published flavour items are base primitives with files under `registry/ui-sdk/` and no replaced import or dependency;
- flavour registryDependencies are `/r/ui-sdk/<x>.json` of a published item, or a shared item;
- `sevenui-tokens` is present;
- lucide and npm ranges match `packages/registry/package.json`;
- `@ui-sdk/*` is an exact version, the same one, in the workspace `package.json` files and every published flavour item and example.

Each failure mode was positive-controlled: an edited seed, a drifted mirror, a react-day-picker seed and a stray file each produced their error.

**`tests/api-freeze.test.ts`.** A ported flavour file must export exactly the base file's names.

**`scripts/smoke-test.sh`.** A fresh consumer project with `@layer ui-sdk;` on line 1 installs `ui-sdk/{dialog,dropdown-menu,select,tooltip,checkbox,badge}`. It asserts that:
- the files land in the `ui` alias, and dialog pulls the flavour button;
- imports are rewritten;
- the served items name `@ui-sdk/*` at the exact pinned version, no served item names it with a range, the consumer's `package.json` lists it and exactly that version lands in `node_modules`, and `@base-ui/react` is not in `package.json`;
- `sevenui-tokens` arrives;
- line 1 is still the layer declaration;
- the layer step is printed;
- base-flavour JSX typechecks against the flavour, including Base UI-only props such as `closeOnClick`, `indeterminate`, `items`, `side="inline-end"` and `TooltipTrigger delay`.

**The smoke test passes**, flavour block included. It used to exit 1 on an older assertion that `--surface-tray:` is declared exactly twice after `select`+`dialog`. That count broke when the token probe moved from `--brand` to `--surface-tray` (`e35a034`): shadcn 4.19.1 does not read a `color-mix()` value as a colour, so the first install already writes a third, pass-through `--surface-tray: var(--surface-tray);` into `@theme inline`. The second install never duplicated anything. The assertion now counts the two theme-block declarations and checks that the second install adds no match.

**`scripts/check-ui-sdk-compat.mjs`** (`pnpm check:ui-sdk-compat`). It typechecks the flavour source of all 1,063 demos and gallery examples (§10: the variant if there is one, else the original, imports retargeted) as a project that installed the flavour sees them: the four replaced libraries are not installed. The original of every variant is typechecked beside it. Two controls keep it honest: a file importing `@base-ui/react/tabs` must be reported, and a type that only the flavour calendar exports must resolve through `@/registry/base/ui/*`. The result, `packages/registry/ui-sdk-compat.json`, classifies each example as `ok`, `differs` (a recorded §8 difference applies) or `variant` (with what the original hits). It fails when an example's flavour source does not typecheck, when a variant replaces an original that needed nothing, and when the manifest is stale.

It runs in CI after `check:registry`, before the build (the site reads the manifest at build time). The site also fails its build when the manifest is missing, empty or holds an unknown status.

**Variants stay current.** `packages/registry/ui-sdk-variants.lock.json` records the hash of the original each variant was reviewed against. When an original changes, `build`, `check-registry`, `check:ui-sdk-compat` and `status --strict` fail until the change is carried into the variant and `node scripts/ui-sdk-flavour.mjs review <path>` records it (the `examples` refresh behind `pnpm dev` only warns).

**`scripts/check-ui-sdk-notes.mjs`** (`pnpm check:ui-sdk-notes`, in CI). The UI SDK notes on the primitive pages and in their `.md` mirrors (`apps/web/lib/ui-sdk-notes.ts`) cite the §8 rows they condense; every row is either cited or listed as internal with a reason, and `apps/web/lib/ui-sdk-notes.lock.json` holds each row's hash, so a row edited since its note was reviewed fails.

The flavour example registries are guarded too: `check-registry` validates them in memory (complete and closed, retargeted `registryDependencies`, no replaced dependency, content = overlay or original) and rejects orphan or no-op overlays; the smoke test installs a flavour demo, a flavour gallery example and two variants into the UI SDK consumer and typechecks it.

## 6. Byte parity

`apps/web/public/r` was built at `e7024e6` (before any flavour work) and at the tip, and compared with `diff -r`. The only difference is the new `r/ui-sdk/` directory: 66 items, the shared `ui-sdk-setup` item and `registry.json`, and `r/ui-sdk/demo/` (148 + `registry.json`) and `r/ui-sdk/component/` (915 + `registry.json`). The other 1,135 files under `r/`, `r/demo/` and `r/component/` are byte-identical.

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
| `base` project | 1,216 tests, 73 files (2026-11-13, verified at the branch tip after both fix rounds and the held name checks) | The original tests pass unchanged; the additions are export-freeze checks for every ported file and tests added with the ports. |
| `ui-sdk` project | 1,068 tests, 68 files (every test file that imports a primitive) | The input-otp paste bug of UI SDK 0.1.0-beta.1 is pinned by its exact strict-mode error and proved without strict mode (guide §8). |

Flavour-specific expectations live in `tests/helpers/flavour.ts`. Each states why it exists.

## 9. Open items

- **19 examples keep a recorded difference** (`differs` in `packages/registry/ui-sdk-compat.json`): real UI SDK limits, not port shortfalls (guide §8).
- The API decision for calendar, carousel and resizable (guide §9).

## 10. Examples in the flavour

Examples are written once, against `@/registry/base/ui/*`. Their flavour is derived, not maintained:
- **Overlay rule.** An example's flavour source is the overlay at `packages/registry/registry/ui-sdk/examples/{demos,components}/<primitive>/<file>.tsx` if one exists (a *variant*), else the original. Primitive imports are retargeted to `@/registry/ui-sdk/`. 15 examples have variants; each changes only what the flavour requires (guide §11).
- **Variants are locked to their originals** (`ui-sdk-variants.lock.json`, §5), so editing an original cannot leave its variant publishing the old example.
- **Flavour example registries.** `node scripts/ui-sdk-flavour.mjs examples` (run by `build` and therefore `build:registry`) writes `packages/registry/.generated/ui-sdk/{demos,components}/registry.json`: the same item names and files as `demos/registry.json` and `components/registry.json`, `registryDependencies` retargeted to `/r/ui-sdk/<x>.json` (shared items unchanged), npm `dependencies` recomputed from the flavour source's imports. `build:registry` builds them to `/r/ui-sdk/demo/` and `/r/ui-sdk/component/`. All 148 + 915 are published; `EXCLUDED_EXAMPLES` (empty) would record any that cannot be.
- **Generated example tree.** The same command writes every flavour source to `packages/registry/.generated/ui-sdk/{demos,components}/<primitive>/<file>.tsx` (git-ignored). The docs site renders flavour previews from it; root `pnpm dev`, `pnpm typecheck` and `pnpm ui-sdk:examples` refresh it.
- The published flavour example source imports `@/registry/ui-sdk/ui/<x>`, like the flavour primitives; the shadcn CLI rewrites it to the consumer's `ui` alias exactly as it rewrites `@/registry/base/ui/<x>` (the smoke test proves it).

**Port fixes made instead of variants (2026-11-13).** select `alignItemWithTrigger` with nothing selected, drawer initial focus on the popup, slider edge alignment, avatar `data-starting-style`, switch `uncheckedValue`, tooltip `trackCursorAxis`/`disableHoverablePopup`, calendar re-press `onSelect` and hidden outside days past `startMonth`/`endMonth`, resizable `data-group`/`data-panel`/`data-separator`. The command "no highlight on mount" difference turned out to be a jsdom artefact (guide §8).
