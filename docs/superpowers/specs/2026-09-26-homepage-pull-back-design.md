# Home page: "Pull Back" — design

Status: approved 2026-09-26. Chosen from three parallel concept studies (A "The git log of one file",
B "Pull Back", C "The Fitting Room"); B is the backbone, with two changes from the owner's review.

## Goal

A home page a visitor spends time on instead of skimming, told through one scroll-driven story that is
not complex and not a catalog: one switch, followed outward from Primitive to Component to Block.

## Decisions

1. **Backbone: concept B.** The story section is one camera move. A sticky stage opens tight on a single
   switch; as the visitor scrolls, the camera pulls back to the free Component that switch lives in
   (`switch-12`, "Public profile"), then to a Pro Block page around it (a stand-in for `account-02`, the
   Account block "built around a visibility control"). Text scrolls at normal speed; only the picture
   sticks. No scroll-jacking.
2. **The slogan stays.** The hero keeps "Copy it. Own it. Ship it." (`<Slogan />`) as display type in a
   `<p>`, under the plain-text H1 "Base UI components for shadcn/ui". Concept B's replacement line
   ("Every page starts as one part.") is not used.
3. **Concept A's ownership line joins the Primitive step**: Base UI keeps the behavior; you keep the
   markup and the styles.
4. **Concept C's paste-your-theme box is deferred** — not on the home page in this change.
5. **The switch on the stage is a native `<input type="checkbox" role="switch">` styled like the
   registry Switch, not the registry component.** The stage is authored in `em` at the zoomed-in size
   and scaled down; the registry Switch is sized in fixed pixels and would not scale with it. The native
   input also makes the state flow (CSS `:has()`) work with JS off and adds no client JS.
6. **The linger moment**: the Email switch works at every size and its state carries up — the card's
   preview shows the email, and the page's Profile panel shows a "Public" badge.
7. **Removed from the home page**: the tier list ("One registry, three sizes." as a ruled list) — its role
   passes to the story — and "The file is yours." section (its claim now lives in the Primitive step).

## Page outline (exact)

- H1 `Base UI components for shadcn/ui`
- H2 `One registry, three sizes.`
  - H3 `Primitive: the switch`
  - H3 `Component: the public profile card`
  - H3 `Block: the account page`
- H2 `Same command at every size.`
- H2 `Start at any size.`

No heading elements inside the stage. The stage `<figure>` carries `data-nosnippet`; its page chrome is
`aria-hidden`.

## Constraints (carried from the 2026-09-26 SEO audit)

- Title, meta description, canonical, OG and JSON-LD for `/` are unchanged.
- All meaningful copy is server-rendered HTML, in the DOM at scroll 0, never starting from opacity 0.
- The hero text stays the LCP element; the hero gains no client JS. CLS stays 0 (only `transform`
  animates; the stage has a fixed `aspect-ratio`).
- Scroll animation is CSS scroll-driven (`view-timeline`), gated by `@supports (animation-timeline:
  view())` and `prefers-reduced-motion: no-preference`. Without support, a small IntersectionObserver
  moves the stage between three fixed framings; with reduced motion the framings change as instant cuts;
  with no JS the switch framing stays and every word stays readable.
- No horizontal scroll at 390px. Internal links are real anchors with descriptive text.

## Known risks

- Framing is coordinate-based: the stage's rows must keep fixed em heights or the switch drifts.
- Off-frame switches stay focusable: focusing one must move the camera to the Component framing.
- On phones the size readout must not cover the card.
- The Block frame is a hand-built stand-in for `account-02`; it links to the real block.
- At full pull-back the stage layer is rastered large; check on a mid-range Android, cap the zoom if heavy.
