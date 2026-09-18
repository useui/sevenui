# Blume-shaped workarounds to retire

Type: grilling
Status: open

## Question

Blume's presence shaped configuration well outside `apps/web`, and some of
those workarounds are load-bearing today. Each needs a decision: delete, keep,
or replace — and at least one of them can break the build if removed carelessly.

Settle, item by item:

1. **`publicHoistPattern` in `pnpm-workspace.yaml`** — eleven registry
   dependencies hoisted because, per its comment, "Blume SSR prerender
   externalizes registry deps; hoist them so Node's ancestor walk from
   apps/web/dist can resolve them." Next.js bundles differently. Does the hoist
   go away, and what proves it (a clean install plus a build of the demos that
   use `embla-carousel-react`, `recharts`, `react-day-picker`,
   `react-resizable-panels`)? Removing it wrongly breaks module resolution at
   build time, not lint time.
2. **`patchedDependencies: blume@1.5.3`** and `patches/blume@1.5.3.patch` —
   delete with Blume. Confirm the patch fixed something in *Blume* (a
   `rafThrottle` bug, upstream PR blume#245) and not something the site still
   needs in its own code.
3. **`apps/web/.blume/` and `apps/web/.blume-verify/`** — generated, gitignored.
   Delete, and remove both `.gitignore` entries.
4. **`blume.config.ts` and `components.ts`** — delete. But
   `blume.config.ts` is also the *only* place several live behaviours are
   declared: the 65-entry sidebar order with its collapsible "Primitives" group,
   the `search.popular` list, the GA4 analytics scripts, the external-link
   `rel` post-build pass, the site title/description/logo, and
   `deployment.site`. Each needs a new home named here or in another ticket.
5. **`@lucide/astro` dependency** — used by `lib/pro-manifest.ts` (`lucideIcon`)
   to resolve manifest icon keys to Astro components. The React port uses
   `lucide-react`, already a dependency. The kebab-to-Pascal resolution and its
   loud throw on an unknown key must survive; confirm the icon key set resolves
   identically in `lucide-react`.
6. **`packages/registry/demos/theme.css`** — goes dead when demos render
   inline. Registry changes are out of scope, so it stays unused on disk.
   Confirm, and record where that is written down so it is not mistaken for
   live code later.
7. **`apps/web/tsconfig.json`** — currently `include`s only `blume.config.ts`
   and maps `@/*` to `packages/registry/*`. The `@/*` alias is the registry
   import convention and is frozen; what does the Next.js tsconfig look like,
   and does the alias still resolve for both the app and the inline demos?
8. **`scripts/smoke-test.sh` and `scripts/check-registry.mjs`** — do either
   assume Blume's output shape (`dist/` layout, HTML structure)? CI runs both.

## Added items (from `07-theme-mechanism-and-token-ownership`)

9. **The `blume-theme` mirror write.** `07` renames the theme storage key to
   `theme` and, to keep `/blocks` previews in sync across the cutover, has the
   app also write the resolved value into `blume-theme`. It is temporary and
   one-way. Retirement condition is explicit: delete once the pro repo reads
   `theme`. Decide where that condition is recorded so it is not orphaned —
   this ticket, or a note in the spec.
10. **`scripts/check-registry.mjs` is no longer only a registry guard.** `07`
    extends its theme-parity loop to cover `apps/web/app/globals.css` as well as
    `packages/registry/demos/theme.css`, because once demos render inline the
    file a visitor actually sees is `globals.css` and nothing guards it. Item 8
    above should account for this when judging whether the script assumes
    Blume's output shape.

Note on item 6: `07` confirms `packages/registry/demos/theme.css` goes dead for
the site (its only consumer is `blume.config.ts:56`) but stays on disk, because
`scripts/check-registry.mjs` reads it to verify the published `cssVars`.

## Added items (from `03-sidebar-and-nav-source-of-truth`)

11. **Blume's `page`-mode nav panel machinery is unreachable code.**
    `components/blume/NavTree.astro` carries a whole second renderer — the
    `blume-nav` custom element, drill-in/back buttons, a 260ms slide with RTL
    handling — and `collectPanels` only emits a panel for a group whose
    `display` is `"page"`. SevenUI declares exactly one group and it is
    `display: "group"`, so **no panel is ever created and none of that code
    runs today**. `03` decided it is not ported: the new sidebar knows a page
    link and one collapsible group. Blume's `collapsed: false` hatch is
    likewise unused and does not come along. Nothing to retire beyond deleting
    the override with Blume — recorded so the slide animation is not mistaken
    for live behaviour to reproduce.

Note on item 4: the "65-entry sidebar order with its collapsible Primitives
group" now has its new home — `lib/docs/nav.ts`, with the set derived from the
content index and the order a slug sort (`03`, decisions 1 and 2), so the list
itself does not move anywhere. `search.popular` still needs a home; `08` owns
it. The remaining `blume.config.ts` residents in item 4 (GA4 scripts, the
external-link `rel` post-build pass, title/description/logo, `deployment.site`)
are untouched by `03`.
