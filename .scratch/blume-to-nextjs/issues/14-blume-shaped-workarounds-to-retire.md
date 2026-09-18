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
