# Next.js replaces Astro/Blume for apps/web

**Status:** accepted (2026-09-19)

`/blocks` is generated at build time from the `sevenui-pro` deployment's manifest, so a block shipped in the pro repo reaches sevenui.dev only when someone manually dispatches `trigger-web-rebuild.yml` and waits for a full web rebuild. We decided to replace Blume 1.5.3 / Astro with a hand-rolled Next.js 16.3.5 App Router site so that `/blocks`, `/blocks/[group]` and `/blocks/[group]/[category]` can be incrementally regenerated on a 300-second window, removing the manual step. Astro has no equivalent; that single capability is the entire justification, and no other benefit is claimed.

## Considered options

- **Stay on Blume and automate the rebuild trigger.** Rejected: it makes the manual dispatch automatic but keeps a full site rebuild in the path of every pro block, so publishing latency stays in minutes and a pro-side failure still breaks a web deploy. It also leaves the site on a meta-framework we had already patched locally.
- **Move to another docs meta-framework (Fumadocs, Nextra).** Rejected: the cost we were paying was not Astro, it was owning none of the pipeline. Swapping one meta-framework for another re-buys that cost in a new dialect. The docs pipeline is therefore hand-rolled — 68 MDX files, a content index we own, and a remark/rehype chain we can read.
- **Split `/blocks` onto a separate Next.js deployment and keep the Astro site.** Rejected: two frameworks, two theme bridges, two chrome implementations, and a rewrite boundary through the middle of the site's own navigation.

## Consequences

Three are worth stating because a future reader would otherwise read them as mistakes.

**JS payload regresses 6–25x on every route, by construction.** A hello-world App Router build is 566 KB raw / 173 KB gzip across 7 chunks, all executed, against 6.8–28.5 KB gzip per route today. That is the price of the framework, not of our code, and it was accepted knowingly. It is recorded as a measurement rather than a CI gate, because performance was deliberately placed outside the cutover's parity gate.

**The migration carries three deliberate fixes that are not parity**, each because the port makes the old behaviour impossible to reproduce honestly: docs demos render inline rather than in iframes, which fixes overlays being clipped to the frame and also stops the frame lying about viewport breakpoints; the search palette is rebuilt on our own `command` primitive, because Blume's dialog cannot be carried over at all; and `/docs/components` becomes a real page, because a breadcrumb needs a real ancestor.

**`data-theme` is frozen and the `localStorage` key is a cross-repo contract.** The pro previews are served same-origin through a `vercel.json` rewrite and sync theme over the native `storage` event — there is no postMessage channel. Renaming the key from `blume-theme` to `theme` therefore requires a temporary one-way mirror write until the pro repo is updated.

The full design is `docs/superpowers/specs/2026-09-18-blume-to-nextjs-migration-design.md`; the decision record behind each choice is `.scratch/blume-to-nextjs/`.
