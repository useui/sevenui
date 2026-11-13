# UI SDK becomes a second primitive flavour

**Status:** accepted (2026-11-13)

## Context

SevenUI was built exclusively on Base UI. We added UI SDK (`@ui-sdk/react` + `@ui-sdk/core`, 0.1.0-beta.1, Vercel Labs) as a second foundation the user selects per install:
- `@sevenui/button` installs the Base UI flavour;
- `@sevenui/ui-sdk/button` installs the UI SDK flavour.

Base UI remains the default. Its output (`/r/*.json`, `/r/demo/*.json`, `/r/component/*.json`) is unchanged byte for byte.

## Decisions

- **One public API for both flavours.** The flavours share:
  - export names (enforced by the export-freeze test);
  - props;
  - `data-slot` values;
  - the `render` prop.

  About 1,060 demo and gallery examples import `@/registry/base/ui/*`, and the shadcn CLI rewrites that import to the user's alias, so one example source has to work against either flavour. Where UI SDK differs, the flavour file adapts and records the divergence.
- **UI SDK wherever UI SDK has the component.** The flavour drops Base UI, and also the third-party wrappers UI SDK replaces: react-day-picker, embla and react-resizable-panels. `chart` keeps recharts; `message-scroller` and `questionnaire` keep `@shadcn/react`.
- **Ported state is derived from the files, never listed.** A flavour file is ported when it imports nothing UI SDK replaces, in any import form. The flavour registry is generated at build time from the root registry and each file's imports, and it is not committed. With this, parallel porters each touch only their own file.
- **The published flavour is a closed graph.** An item that depends on an unported item is held back. Now that every primitive is ported, the flavour must also be complete: anything pending or blocked fails the check.

## Considered options

| Option | Rejected because |
|---|---|
| A separate package or repository for the flavour | Two copies of the registry tooling, the tests and the docs, and no shared export-freeze contract. |
| Committing the generated flavour registry with a staleness check | Every port changes it, so it becomes the one file all porters edit. |
| Leaving unported primitives absent from the tree | Ported files could not import them, so porters would have to finish in dependency order. Unpublished seed copies kept the tree resolvable while porting was under way; an edited seed failed the check. No seed remains. |

## Consequences

- **One manual step for consumers.** UI SDK's runtime CSS lives in `@layer ui-sdk`, which must be declared above `@import "tailwindcss"`. shadcn can only append CSS, so the step is printed on install rather than performed, once per install: the message lives on one shared `ui-sdk-setup` item. A default setup works without the line because UI SDK prepends its styles; the line protects setups where its styles arrive later.
- **Divergences are permanent and documented.** Examples:
  - closed tooltips stay mounted with `hidden`;
  - opening a select by pointer highlights the first option;
  - there is no Positioner element;
  - reason strings in callback details differ.

  The tests encode each one through small flavour-aware helpers rather than weakened assertions.
- **Examples are flavoured too.** Every demo and gallery example is also published at `/r/ui-sdk/demo/*` and `/r/ui-sdk/component/*`, depending on the flavour primitives. The 15 examples that cannot work unchanged have variants (overlays); a committed lock fails the checks when a variant's original changes until the variant is reviewed.
- **One exact UI SDK version.** UI SDK is a beta, so `@ui-sdk/*` is pinned exactly in the workspace and in every published item, and `check-registry` rejects a range. The registry cannot make a consumer's package manager save it exactly: pnpm, yarn and bun do, npm saves a caret, so the docs give npm users the fix.
- **Pro blocks stay on Base UI.** Only primitives and their free examples have a UI SDK flavour.
- **The site's notes are tied to the divergence table.** Every UI SDK difference shown on a primitive page cites its row in the guide's §8, and `check-ui-sdk-notes` fails when a row changes until its note is reviewed.

The full design is `docs/superpowers/specs/2026-11-13-ui-sdk-flavour-design.md`. The porter's manual is `docs/superpowers/plans/2026-11-13-ui-sdk-porting-guide.md`.
