# Home page "Pull Back" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home page's tier list and "The file is yours." section with one scroll-driven story — a switch followed outward from Primitive to Component to Block — plus two short static sections, without regressing the SEO audit's gains.

**Architecture:** Server components only, plus one tiny client component for the no-scroll-timeline fallback. The stage is a fixed-aspect `<figure>` holding a "world" authored in `em` at the zoomed-in size; a CSS `view-timeline` on the story grid scales and translates that world between three framings. State flows from the native switches to the card preview and the page badge through CSS `:has()`.

**Tech Stack:** Next.js 16 App Router (RSC), Tailwind v4 utilities plus one plain CSS file, CSS scroll-driven animations, Node 24 for the gate script.

**Spec:** `docs/superpowers/specs/2026-09-26-homepage-pull-back-design.md`
**Reference prototype (read-only, not in the repo):** concept B's `prototype.html` from the 2026-09-26 study; every coordinate below is copied from it.

## Before You Start

- `main` already carries the SEO audit (`ed2baba feat(web): act on the SEO audit`, live on sevenui.dev): the plain-text H1, `lib/pro-pricing.ts`, the gallery's lazy code, `og-sweep.mjs`'s five title rules. This plan builds on it.
- Work on a new branch from `main`: `git switch -c feat/home-pull-back`. (`feat/redesign-home` is an older, already-merged branch — do not reuse it.)
- This spec and this plan are untracked files in the working tree. With the owner's go, commit them first on the new branch: `git add docs/superpowers && git commit -m "docs(web): plan the Pull Back home page"`.
- The build needs the Pro manifest. With a local `../sevenui-pro` checkout, run `node scripts/build-manifest.mjs` there if `dist/r/pro-manifest.json` is missing, and pass `PRO_MANIFEST_URL="$PWD/../sevenui-pro/dist/r/pro-manifest.json"` to `pnpm build`; otherwise omit it and the build reads the live manifest.

## Global Constraints

- The H1 text is exactly `Base UI components for shadcn/ui`; exactly one H1 on `/`.
- The heading outline of `/` is exactly the seven lines in the spec's "Page outline"; no heading elements inside the stage.
- The hero keeps `<Slogan />` inside a `<p>`, never inside a heading; the hero gains no client JS.
- Title, description, canonical, OG, JSON-LD for `/` are unchanged (`generateMetadata`, `RootUrlTags`, `JsonLd` stay as they are).
- All copy is server-rendered and visible at scroll 0; nothing starts at `opacity: 0` except the decorative "Try the switch" hint fading *out*.
- Only `transform` (and the readout pills' colors) animate. The stage has `aspect-ratio: 64 / 40`.
- Scroll animation only under `@supports (animation-timeline: view())` and `@media (prefers-reduced-motion: no-preference)`.
- No horizontal scroll at 390px width.
- Vocabulary (AGENTS.md): Primitive / Component / Block. Counts come from `registry-data.ts` and `loadCatalog()`, never literals. Prices come from `lib/pro-pricing.ts`.
- English everywhere in the repo; kebab-case file names; Conventional Commits with no attribution trailers. Commit only when the owner says go.

## Review Focus

1. A keyboard user tabbing into the stage at the Primitive framing lands on Company, Location or Phone — switches outside the frame. Expected: the camera shows the Component framing while any non-Email switch has keyboard focus. (Task 3, Step 5 check.)
2. A phone at 390px: the size readout covers the card title at the Component framing, or the stage causes horizontal scroll. Expected: readout sits under the stage below 640px; `scrollWidth === innerWidth`. (Task 3, Step 6 check.)
3. Firefox/Safari without scroll timelines, and reduced motion. Expected: three discrete framings driven by the step in view; reduced motion cuts without transition. (Task 3, Step 7 check.)
4. Dark theme (the site's `.dark` class and the system preference). Expected: the stage reads correctly because every color is a token. (Task 2, Step 6 check.)
5. Framing drift: the Email switch is not centered at the Primitive framing after any markup tweak. Expected: its center within 3% of the stage center. (Task 2, Step 6 check.)

---

## File Structure

- Create `scripts/check-home.mjs` — fetch-based gate for `/`: outline, no-JS copy, stage hygiene, commands, links; `--controls` proves each assertion can fail.
- Create `apps/web/components/home/pull-back/pull-back.css` — all stage layout, keyframes, fallback and reduced-motion states (`pb-` prefixed classes).
- Create `apps/web/components/home/pull-back/stage.tsx` — server component: the figure, readout, hint, and the world (page chrome + the Public profile card).
- Create `apps/web/components/home/pull-back/story.tsx` — server component: the "One registry, three sizes." section (heading, lead, stage column, three steps).
- Create `apps/web/components/home/pull-back/scale-fallback.tsx` — client component: IntersectionObserver fallback, renders nothing.
- Modify `apps/web/app/page.tsx` — new hero lede, story, "Same command at every size.", "Start at any size."; delete the tier list and "The file is yours." sections and now-unused imports.
- Modify `apps/web/components/home/registry-data.ts` — delete `sourceOf` (its only caller was the removed section).

---

### Task 1: The home page gate

**Files:**
- Create: `scripts/check-home.mjs`
- Modify: `package.json` (root) — add `"check:home": "node scripts/check-home.mjs"`

**Interfaces:**
- Produces: `node scripts/check-home.mjs --base <url> [--controls]`; exit 0 when every assertion holds, 1 otherwise. Later tasks run it against `http://localhost:3456`.

- [ ] **Step 1: Write the gate**

```js
#!/usr/bin/env node
// Asserts the home page's SEO contract on the server-rendered HTML (no JS runs here, which is the
// point: a crawler and a no-JS visitor see exactly this). `--controls` breaks the captured HTML once
// per assertion and requires that assertion to fail, so a check that cannot fail is caught.

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, i, all) => {
    if (arg === "--controls") pairs.push(["controls", true]);
    else if (arg.startsWith("--") && all[i + 1] && !all[i + 1].startsWith("--")) pairs.push([arg.slice(2), all[i + 1]]);
    return pairs;
  }, []),
);
if (!args.base) {
  console.error("usage: check-home.mjs --base <url> [--controls]");
  process.exit(2);
}

const OUTLINE = [
  "h1 Base UI components for shadcn/ui",
  "h2 One registry, three sizes.",
  "h3 Primitive: the switch",
  "h3 Component: the public profile card",
  "h3 Block: the account page",
  "h2 Same command at every size.",
  "h2 Start at any size.",
];
const COMMANDS = ["@sevenui/button", "@sevenui/switch", "@sevenui/component/switch-12", "@sevenui/pro/account-02"];
const LINKS = ["/docs", "/docs/components/switch", "/components", "/blocks", "/pro", "/blocks/application/account#account-02"];
const STEP_COPY = [
  "Base UI keeps the behavior",
  "composed into a card that decides what a public profile shows",
  "The same card inside a finished page",
];

const text = (html) =>
  html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/\s+/g, " ").trim();

function outline(html) {
  return [...html.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/g)].map((m) => `${m[1]} ${text(m[2])}`);
}

function stageHtml(html) {
  const start = html.indexOf("data-nosnippet");
  if (start === -1) return undefined;
  const end = html.indexOf("</figure>", start);
  return end === -1 ? undefined : html.slice(start, end);
}

const CHECKS = {
  outline: {
    name: "the heading outline is exactly the spec's seven lines",
    run: (html) => {
      const got = outline(html);
      return JSON.stringify(got) === JSON.stringify(OUTLINE) ? null : `got ${JSON.stringify(got)}`;
    },
    breakIt: (html) => html.replace("</main>", "<h2>Stray</h2></main>"),
  },
  h1Plain: {
    name: "the h1 holds plain text only (no animated child elements)",
    run: (html) => {
      const m = /<h1\b[^>]*>([\s\S]*?)<\/h1>/.exec(html);
      return m && !/</.test(m[1]) ? null : `h1 inner: ${m?.[1].slice(0, 80)}`;
    },
    breakIt: (html) => html.replace(/(<h1\b[^>]*>)/, "$1<span>x</span>"),
  },
  slogan: {
    name: "the slogan is in the HTML, outside every heading",
    run: (html) => {
      if (!html.includes("Copy it. Own it. Ship it.")) return "slogan text missing";
      const inHeading = outline(html).some((line) => line.includes("Copy it"));
      return inHeading ? "slogan sits inside a heading" : null;
    },
    breakIt: (html) => html.replaceAll("Copy it. Own it. Ship it.", "Copy it."),
  },
  stage: {
    name: "the stage exists, carries data-nosnippet, and holds no headings",
    run: (html) => {
      const stage = stageHtml(html);
      if (!stage) return "no data-nosnippet figure";
      return /<h[1-6]\b/.test(stage) ? "a heading inside the stage" : null;
    },
    breakIt: (html) => html.replace("data-nosnippet", "data-nosnippet><h4>x</h4"),
  },
  stepCopy: {
    name: "every story step's copy is in the server HTML",
    run: (html) => {
      const flat = text(html);
      const missing = STEP_COPY.filter((phrase) => !flat.includes(phrase));
      return missing.length ? `missing: ${missing.join(" | ")}` : null;
    },
    breakIt: (html) => html.replace("Base UI keeps the behavior", "Base UI"),
  },
  commands: {
    name: "the four install commands are in the server HTML",
    run: (html) => {
      const missing = COMMANDS.filter((command) => !html.includes(command));
      return missing.length ? `missing: ${missing.join(", ")}` : null;
    },
    breakIt: (html) => html.replaceAll("@sevenui/component/switch-12", "@sevenui/x"),
  },
  links: {
    name: "the internal links are real anchors",
    run: (html) => {
      const missing = LINKS.filter((href) => !html.includes(`href="${href}"`));
      return missing.length ? `missing: ${missing.join(", ")}` : null;
    },
    breakIt: (html) => html.replaceAll('href="/blocks"', 'href="/x"'),
  },
  noOldSections: {
    name: "the removed sections are gone",
    run: (html) => (text(html).includes("The file is yours.") ? '"The file is yours." still rendered' : null),
    breakIt: (html) => html.replace("</main>", "<p>The file is yours.</p></main>"),
  },
};

const response = await fetch(new URL("/", args.base));
if (!response.ok) {
  console.error(`GET / -> ${response.status}`);
  process.exit(1);
}
const html = await response.text();

let failed = 0;
for (const check of Object.values(CHECKS)) {
  const problem = check.run(html);
  console.log(`${problem ? "FAIL" : "PASS"}  ${check.name}${problem ? `\n      ${problem}` : ""}`);
  if (problem) failed++;
}

if (args.controls) {
  console.log("");
  for (const [key, check] of Object.entries(CHECKS)) {
    const broken = check.breakIt(html);
    if (broken === html) {
      console.log(`DEAD  ${key}: the control changed nothing`);
      failed++;
    } else if (check.run(broken) === null) {
      console.log(`DEAD  ${key}: still passes on broken HTML`);
      failed++;
    } else {
      console.log(`LIVE  ${key}`);
    }
  }
}

process.exit(failed ? 1 : 0);
```

- [ ] **Step 2: Add the script to the root `package.json`**

In `"scripts"`, after `"check:docs-imports"`, add:

```json
    "check:home": "node scripts/check-home.mjs",
```

- [ ] **Step 3: Run it against the current home page and watch it fail**

```bash
PRO_MANIFEST_URL="$PWD/../sevenui-pro/dist/r/pro-manifest.json" pnpm build
cd apps/web && (pnpm exec next start -p 3456 & echo $! > /tmp/sevenui-home.pid) && cd ../..
node scripts/check-home.mjs --base http://localhost:3456
```

(Without a local pro checkout, drop `PRO_MANIFEST_URL`; the build then reads the live manifest.)

Expected: FAIL on `outline`, `stage`, `stepCopy`, `commands`, `links`, `noOldSections`; PASS on `h1Plain` and `slogan`.

- [ ] **Step 4: Stop the server by the PID of the listening process**

```bash
kill $(lsof -tiTCP:3456 -sTCP:LISTEN)
```

`pkill -f "next start"` does not match: the process renames itself `next-server`. A stale server keeps serving the old build and rewrites `.next` pages through ISR.

- [ ] **Step 5: Commit** (only after the owner says go)

```bash
git add scripts/check-home.mjs package.json
git commit -m "test(web): gate the home page's heading outline and no-JS copy"
```

---

### Task 2: The stage and the story, static

**Files:**
- Create: `apps/web/components/home/pull-back/pull-back.css`
- Create: `apps/web/components/home/pull-back/stage.tsx`
- Create: `apps/web/components/home/pull-back/story.tsx`
- Modify: `apps/web/app/page.tsx` — replace the tier-list `<section aria-labelledby="tiers-title">` with `<Story … />`

**Interfaces:**
- Produces: `Stage()` (no props); `Story(props: { primitiveCount: number; componentCount: number; blockCount: number; categoryCount: number; primitivesHref: string })`.
- Produces CSS hooks used by Task 3: `.pb-story-grid` (timeline owner), `#pb-stage.pb-stage[data-scale="1"|"2"|"3"]` (wrapper), `.pb-view` (the clipped picture, `data-nosnippet`), `.pb-world`, `.pb-ro-1/2/3`, `.pb-try`, `.pb-step[data-step="1"|"2"|"3"]`, switch ids `pb-sw-company`, `pb-sw-location`, `pb-sw-email`, `pb-sw-phone`.

- [ ] **Step 1: Write `pull-back.css` (layout and the resting framing only; motion comes in Task 3)**

```css
/* The home page's "Pull Back" story. The world is authored at the zoomed-in size, in em on a
   64 x 40 page, and only ever scaled down, so text stays sharp. 1 world em = stage width / 64 * 7. */

.pb-story-grid {
  view-timeline-name: --pb-story;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}
@media (min-width: 900px) {
  .pb-story-grid {
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    column-gap: 3.5rem;
  }
}

.pb-stage-col {
  position: sticky;
  top: 4rem; /* the site header is h-16 */
  z-index: 5;
  align-self: start;
  background: var(--background);
  padding-block: 0.75rem;
  border-bottom: 1px solid var(--border);
}
@media (min-width: 900px) {
  .pb-stage-col {
    grid-column: 2;
    grid-row: 1;
    top: calc(4rem + max(1.5rem, (100vh - 4rem - 460px) / 2));
    border: 0;
    padding: 0;
  }
}

.pb-steps { list-style: none; margin: 0; padding: 0; }
@media (min-width: 900px) { .pb-steps { grid-column: 1; grid-row: 1; } }
.pb-step {
  min-height: 72svh;
  padding-block: 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
@media (min-width: 900px) { .pb-step { min-height: 88vh; } }

/* .pb-stage is the wrapper that carries data-scale; .pb-view is the clipped picture inside it. The
   readout is the wrapper's other child, so on phones it can sit below the picture instead of over it. */
.pb-stage { position: relative; }
.pb-view {
  margin: 0;
  position: relative;
  container-type: inline-size;
  aspect-ratio: 64 / 40;
  width: 100%;
  overflow: clip;
  border: 1px solid var(--border);
  border-radius: calc(var(--radius) + 6px);
  background: var(--muted);
}
@media (min-width: 900px) { .pb-view { max-width: 46rem; } }

.pb-world {
  position: absolute;
  inset: 0 auto auto 0;
  width: 64em;
  height: 40em;
  font-size: calc(700cqi / 64);
  transform-origin: 0 0;
  transform: translate(-53.43em, -26.75em) scale(1);
  background: var(--background);
  color: var(--foreground);
}
.pb-stage[data-scale="2"] .pb-world { transform: translate(-7.086em, -2.217em) scale(0.228571); }
.pb-stage[data-scale="3"] .pb-world { transform: translate(0, 0) scale(0.142857); }

/* Which size the camera is at. Under 640px it sits below the stage so it never covers the card. */
.pb-readout {
  position: absolute;
  left: 10px;
  top: 10px;
  z-index: 2;
  display: flex;
  gap: 2px;
  padding: 3px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: color-mix(in oklch, var(--background) 85%, transparent);
  backdrop-filter: blur(6px);
  font-size: 11px;
  font-weight: 500;
}
@media (max-width: 639px) {
  .pb-readout { position: static; width: max-content; margin-top: 0.5rem; backdrop-filter: none; }
}
.pb-readout span { padding: 3px 9px; border-radius: 999px; opacity: 0.75; }
.pb-ro-1,
.pb-stage[data-scale="2"] .pb-ro-2,
.pb-stage[data-scale="3"] .pb-ro-3 { opacity: 1; background: var(--primary); color: var(--primary-foreground); }
.pb-stage[data-scale="2"] .pb-ro-1,
.pb-stage[data-scale="3"] .pb-ro-1 { opacity: 0.75; background: transparent; color: var(--foreground); }

.pb-try {
  position: absolute;
  z-index: 2;
  left: 10px;
  bottom: 10px;
  font-size: 11px;
  font-weight: 500;
  padding: 4px 9px;
  border-radius: 999px;
  background: var(--background);
  border: 1px solid var(--border);
}
.pb-stage[data-scale="2"] .pb-try,
.pb-stage[data-scale="3"] .pb-try { visibility: hidden; }

/* The page inside the stage (a stand-in for the account-02 Block). */
.pb-w { position: absolute; }
.pb-side { left: 0; top: 0; width: 12em; height: 40em; background: var(--muted); border-right: 0.08em solid var(--border); padding: 1.4em 1.1em; }
.pb-logo { display: flex; align-items: center; gap: 0.55em; font-weight: 600; }
.pb-logo i { width: 1.3em; height: 1.3em; border-radius: 0.35em; background: var(--primary); display: block; }
.pb-nav { margin-top: 2em; display: grid; gap: 0.35em; font-size: 0.95em; }
.pb-nav span { padding: 0.45em 0.7em; border-radius: 0.45em; color: var(--muted-foreground); }
.pb-nav .pb-on { background: var(--background); color: var(--foreground); font-weight: 500; box-shadow: 0 0 0 0.08em var(--border); }
.pb-top { left: 12em; top: 0; width: 52em; height: 4em; border-bottom: 0.08em solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 2em; font-size: 0.95em; color: var(--muted-foreground); }
.pb-top b { color: var(--foreground); font-weight: 500; }
.pb-av { width: 2.2em; height: 2.2em; border-radius: 50%; background: linear-gradient(135deg, oklch(0.75 0.08 60), oklch(0.6 0.1 20)); display: grid; place-items: center; color: white; font-size: 0.8em; font-weight: 600; }
.pb-title { left: 14em; top: 5.4em; }
.pb-title > span { display: block; }
.pb-title > span:first-child { font-size: 2em; font-weight: 600; letter-spacing: -0.03em; line-height: 1.2; }
.pb-title > span:last-child { font-size: 0.95em; color: var(--muted-foreground); margin-top: 0.2em; }
.pb-card { background: var(--card); border: 0.08em solid var(--border); border-radius: 0.8em; padding: 1em 1.2em; }
.pb-card-t { display: block; font-weight: 600; }
.pb-card-d { display: block; font-size: 0.8em; color: var(--muted-foreground); margin-top: 0.15em; }
.pb-profile { left: 14em; top: 11em; width: 24em; height: 12.5em; }
.pb-field { display: grid; grid-template-columns: 5.5em 1fr auto; align-items: center; gap: 0.6em; font-size: 0.85em; padding: 0.75em 0; border-top: 0.08em solid var(--border); }
.pb-field:first-of-type { margin-top: 0.9em; }
.pb-field span:first-child { color: var(--muted-foreground); }
.pb-pill { font-size: 0.8em; padding: 0.15em 0.6em; border-radius: 999px; border: 0.08em solid var(--border); color: var(--muted-foreground); }
.pb-sessions { left: 14em; top: 25em; width: 24em; height: 6.5em; }
.pb-session { display: flex; justify-content: space-between; font-size: 0.8em; margin-top: 0.7em; color: var(--muted-foreground); }
.pb-danger { left: 14em; top: 33em; width: 24em; height: 5em; display: flex; align-items: center; justify-content: space-between; border-color: color-mix(in oklch, var(--destructive) 40%, var(--border)); }
.pb-danger-btn { font-size: 0.8em; padding: 0.45em 0.9em; border-radius: 0.5em; background: var(--destructive); color: white; font-weight: 500; }

/* The Component: the Public profile card (switch-12). Row heights are fixed: the framing depends on them. */
.pb-pc { left: 40em; top: 11em; width: 22em; height: 22.4em; padding: 1em; box-shadow: 0 0.6em 2em -1em color-mix(in oklch, var(--foreground) 25%, transparent); }
.pb-pc-hd { height: 3.4em; }
.pb-pv { height: 7em; background: var(--muted); border-radius: 0.6em; padding: 0.8em; }
.pb-who { display: flex; align-items: center; gap: 0.7em; }
.pb-who .pb-av { width: 2.4em; height: 2.4em; }
.pb-who-name { display: block; font-size: 0.85em; font-weight: 500; }
.pb-who-handle { display: block; font-size: 0.72em; color: var(--muted-foreground); }
.pb-pv ul { list-style: none; margin: 0.6em 0 0; padding: 0; display: grid; gap: 0.3em; font-size: 0.72em; }
.pb-pv li { display: none; align-items: center; gap: 0.5em; white-space: nowrap; overflow: hidden; }
.pb-pv li::before { content: ""; width: 0.5em; height: 0.5em; border-radius: 50%; background: var(--muted-foreground); flex: none; }
.pb-pv li.pb-empty { display: block; color: var(--muted-foreground); }
.pb-pv li.pb-empty::before { display: none; }
.pb-rows { margin-top: 0.6em; }
.pb-row { height: 2.6em; display: flex; align-items: center; justify-content: space-between; gap: 0.8em; border-top: 0.08em solid var(--border); }
.pb-row:first-child { border-top: 0; }
.pb-row label { min-width: 0; cursor: pointer; }
.pb-row-label { display: block; font-size: 0.85em; font-weight: 500; }
.pb-row-value { display: block; font-size: 0.7em; color: var(--muted-foreground); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 11em; }
.pb-right { display: flex; align-items: center; gap: 0.5em; }
.pb-state { font-size: 0.7em; color: var(--muted-foreground); width: 3.6em; text-align: right; }
.pb-state .pb-on-label { display: none; }
.pb-row:has(.pb-sw:checked) .pb-state .pb-on-label { display: inline; }
.pb-row:has(.pb-sw:checked) .pb-state .pb-off-label { display: none; }

/* The Switch, drawn like the registry Switch but in em so it scales with the world. */
.pb-sw {
  appearance: none;
  margin: 0;
  flex: none;
  font-size: inherit;
  cursor: pointer;
  width: 2em;
  height: 1.15em;
  border-radius: 999px;
  background: var(--input);
  position: relative;
  transition: background-color 0.2s;
}
.pb-sw::before {
  content: "";
  position: absolute;
  top: 0.125em;
  left: 0.125em;
  width: 0.9em;
  height: 0.9em;
  border-radius: 50%;
  background: var(--background);
  box-shadow: 0 0.05em 0.15em rgb(0 0 0 / 0.2);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.pb-sw:checked { background: var(--primary); }
.pb-sw:checked::before { transform: translateX(0.85em); }
.pb-sw:focus-visible { outline: 0.12em solid var(--ring); outline-offset: 0.12em; }
@media (prefers-reduced-motion: reduce) { .pb-sw, .pb-sw::before { transition: none; } }

/* State flows up the sizes: the switches decide what the card and the page show. No JS. */
.pb-world:has(#pb-sw-company:checked) .pb-pv-company,
.pb-world:has(#pb-sw-location:checked) .pb-pv-location,
.pb-world:has(#pb-sw-email:checked) .pb-pv-email,
.pb-world:has(#pb-sw-phone:checked) .pb-pv-phone { display: flex; }
.pb-world:has(.pb-sw:checked) .pb-pv li.pb-empty { display: none; }
.pb-email-pill .pb-pub,
.pb-world:has(#pb-sw-email:checked) .pb-email-pill .pb-priv { display: none; }
.pb-world:has(#pb-sw-email:checked) .pb-email-pill .pb-pub { display: inline; }
.pb-world:has(#pb-sw-email:checked) .pb-email-pill { background: var(--primary); color: var(--primary-foreground); border-color: transparent; }
```

- [ ] **Step 2: Write `stage.tsx`**

```tsx
import "./pull-back.css";

const FIELDS = [
  { id: "company", label: "Company", value: "Product designer at Northwind", on: true },
  { id: "location", label: "Location", value: "Lisbon, Portugal", on: true },
  { id: "email", label: "Email", value: "ava.moreno@northwind.app", on: false },
  { id: "phone", label: "Phone", value: "+351 912 408 331", on: false },
] as const;

/**
 * The story's picture: a switch inside the Public profile card (the switch-12 Component) inside an
 * account page (a stand-in for the account-02 Block). Illustrative, so no headings, the page chrome is
 * aria-hidden, and data-nosnippet keeps the mock names out of search snippets. The card's switches are
 * real controls; their state reaches the preview and the page through CSS :has(), with no JS.
 */
export function Stage() {
  return (
    <>
      <div className="pb-stage" data-scale="1" id="pb-stage">
      <figure className="pb-view" data-nosnippet="">
        <div aria-hidden="true" className="pb-try">
          Try the switch
        </div>

        <div className="pb-world">
          <div aria-hidden="true">
            <div className="pb-w pb-side">
              <div className="pb-logo">
                <i />
                Northwind
              </div>
              <div className="pb-nav">
                <span>Overview</span>
                <span>Projects</span>
                <span>Members</span>
                <span>Billing</span>
                <span className="pb-on">Account</span>
              </div>
            </div>
            <div className="pb-w pb-top">
              <span>
                Settings / <b>Account</b>
              </span>
              <span className="pb-av">AM</span>
            </div>
            <div className="pb-w pb-title">
              <span>Account</span>
              <span>Manage how you appear outside Northwind.</span>
            </div>
            <div className="pb-w pb-card pb-profile">
              <span className="pb-card-t">Profile</span>
              <span className="pb-card-d">Your name and contact details.</span>
              <div className="pb-field">
                <span>Name</span>
                <span>Ava Moreno</span>
                <span />
              </div>
              <div className="pb-field">
                <span>Handle</span>
                <span>@avamoreno</span>
                <span />
              </div>
              <div className="pb-field">
                <span>Email</span>
                <span>ava.moreno@northwind.app</span>
                <span className="pb-pill pb-email-pill">
                  <span className="pb-priv">Private</span>
                  <span className="pb-pub">Public</span>
                </span>
              </div>
            </div>
            <div className="pb-w pb-card pb-sessions">
              <span className="pb-card-t">Sessions</span>
              <div className="pb-session">
                <span>MacBook Pro · Lisbon</span>
                <span>Now</span>
              </div>
              <div className="pb-session">
                <span>iPhone · Lisbon</span>
                <span>2 h ago</span>
              </div>
            </div>
            <div className="pb-w pb-card pb-danger">
              <div>
                <span className="pb-card-t">Delete account</span>
                <span className="pb-card-d">This cannot be undone.</span>
              </div>
              <span className="pb-danger-btn">Delete</span>
            </div>
          </div>

          <div aria-labelledby="pb-pc-title" className="pb-w pb-card pb-pc" role="group">
            <div className="pb-pc-hd">
              <span className="pb-card-t" id="pb-pc-title">
                Public profile
              </span>
              <span className="pb-card-d">Choose what people outside your team see.</span>
            </div>
            <div className="pb-pv">
              <div aria-hidden="true" className="pb-who">
                <span className="pb-av">AM</span>
                <span>
                  <span className="pb-who-name">Ava Moreno</span>
                  <span className="pb-who-handle">@avamoreno</span>
                </span>
              </div>
              <ul aria-live="polite">
                {FIELDS.map((field) => (
                  <li className={`pb-pv-${field.id}`} key={field.id}>
                    {field.value}
                  </li>
                ))}
                <li className="pb-empty">Only your name and photo are public.</li>
              </ul>
            </div>
            <div className="pb-rows">
              {FIELDS.map((field) => (
                <div className="pb-row" key={field.id}>
                  <label htmlFor={`pb-sw-${field.id}`}>
                    <span className="pb-row-label">{field.label}</span>
                    <span className="pb-row-value">{field.value}</span>
                  </label>
                  <span className="pb-right">
                    <span aria-hidden="true" className="pb-state">
                      <span className="pb-off-label">Private</span>
                      <span className="pb-on-label">Public</span>
                    </span>
                    <input
                      className="pb-sw"
                      defaultChecked={field.on}
                      id={`pb-sw-${field.id}`}
                      role="switch"
                      type="checkbox"
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </figure>
      <div aria-hidden="true" className="pb-readout">
        <span className="pb-ro-1">Primitive</span>
        <span className="pb-ro-2">Component</span>
        <span className="pb-ro-3">Block</span>
      </div>
      </div>
      <p className="mt-2 hidden text-[0.8125rem] text-muted-foreground min-[900px]:block">
        The switch keeps its state as you scroll: flip Email, then watch the card and the page follow it.
      </p>
    </>
  );
}
```

- [ ] **Step 3: Write `story.tsx`**

```tsx
import Link from "next/link";
import { InstallCommand } from "../install-command";
import { packageManagerCommands } from "../../../lib/package-manager";
import { PRO_LAUNCH } from "../../../lib/pro-pricing";
import { installCommand } from "../../../lib/registry";
import { Stage } from "./stage";

const H2 = "text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-[2.5rem] sm:leading-[1.1]";
const LEAD = "leading-relaxed text-pretty text-muted-foreground";
const QUIET_LINK =
  "inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-foreground/30 underline-offset-[5px] transition-colors hover:decoration-foreground";

const commandsFor = (item: string) => packageManagerCommands((pm) => installCommand(item, pm));

export function Story({
  primitiveCount,
  componentCount,
  blockCount,
  categoryCount,
  primitivesHref,
}: {
  primitiveCount: number;
  componentCount: number;
  blockCount: number;
  categoryCount: number;
  primitivesHref: string;
}) {
  const steps = [
    {
      tier: "Primitive · free, MIT",
      title: "Primitive: the switch",
      body: (
        <>
          One file, <code>switch.tsx</code>. Base UI keeps the behavior: the switch role, focus and keyboard.
          You keep the markup and the styles, on the shadcn/ui variables you already have. Flip the Email
          switch; it stays live all the way out.
        </>
      ),
      item: "switch",
      links: [{ href: primitivesHref, label: `Browse all ${primitiveCount} primitives` }],
    },
    {
      tier: "Component · free",
      title: "Component: the public profile card",
      body: (
        <>
          Card, Avatar, Label and Switch, composed into a card that decides what a public profile shows. If
          you turned Email on, it is in the preview now. Copy the component and change it however you like.
        </>
      ),
      item: "component/switch-12",
      links: [{ href: "/components", label: `Browse ${componentCount} free components` }],
    },
    {
      tier: "Block · Pro",
      title: "Block: the account page",
      body: (
        <>
          The same card inside a finished page, with navigation, profile, sessions and a danger zone.{" "}
          {blockCount} Pro Blocks across {categoryCount} categories, installed with the same CLI as the switch.
        </>
      ),
      item: "pro/account-02",
      links: [
        { href: "/blocks/application/account#account-02", label: "Preview the real account block" },
        { href: "/blocks", label: `See all ${blockCount} Pro Blocks` },
        { href: "/pro", label: `Get Pro for ${PRO_LAUNCH}, once` },
      ],
    },
  ];

  return (
    <section aria-labelledby="story-title" className="border-b border-border">
      <div className="l-row px-6 pt-20 sm:px-8 sm:pt-28">
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-end">
          <h2 className={H2} id="story-title">
            One registry, three sizes.
          </h2>
          <p className={`${LEAD} max-w-[52ch]`}>
            Follow one switch outward. On its own it is a Primitive. Inside a card it is part of a Component. In
            a finished account page it is part of a Pro Block. The code is the same at every size.
          </p>
        </div>

        <div className="pb-story-grid mt-10 pb-10">
          <div className="pb-stage-col">
            <Stage />
          </div>
          <ol className="pb-steps">
            {steps.map((step, index) => (
              <li className="pb-step" data-step={index + 1} key={step.title}>
                <span className="text-[0.8125rem] font-medium text-muted-foreground">{step.tier}</span>
                <h3 className="mt-1.5 text-2xl font-semibold tracking-[-0.025em]">{step.title}</h3>
                <p className={`${LEAD} mt-3 max-w-[46ch]`}>{step.body}</p>
                <InstallCommand
                  className="mt-5 max-w-[30rem]"
                  commands={commandsFor(step.item)}
                  label={`${step.item} install command`}
                />
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                  {step.links.map((link) => (
                    <Link className={QUIET_LINK} href={link.href} key={link.href}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Put the story on the page**

In `apps/web/app/page.tsx`:
- add `import { Story } from "../components/home/pull-back/story";`
- delete the `tiers` array;
- replace the whole `{/* The three tiers, as one ruled list instead of a stats row. */}` section with:

```tsx
      <Story
        blockCount={catalog.blockCount}
        categoryCount={catalog.categoryCount}
        componentCount={componentCount}
        primitiveCount={primitiveCount}
        primitivesHref={primitivesHref}
      />
```

- [ ] **Step 5: Build, start, and run the gate**

```bash
kill $(lsof -tiTCP:3456 -sTCP:LISTEN) 2>/dev/null; PRO_MANIFEST_URL="$PWD/../sevenui-pro/dist/r/pro-manifest.json" pnpm build
cd apps/web && (pnpm exec next start -p 3456 &) && cd ../..
node scripts/check-home.mjs --base http://localhost:3456
```

Expected: PASS on `h1Plain`, `slogan`, `stage`, `stepCopy`, `commands` (each step's `InstallCommand` server-renders its command for the default package manager); still FAIL on `outline` (the old "The file is yours." H2 is there and the two closing H2s are not), `links` (only `/docs/components/switch` is missing; it arrives in Task 4) and `noOldSections`.

- [ ] **Step 6: Check the framing and the dark theme in Chrome**

Open `http://localhost:3456/`, scroll until the stage is in view, and run in DevTools:

```js
const s = document.querySelector(".pb-view").getBoundingClientRect();
const w = document.querySelector("#pb-sw-email").getBoundingClientRect();
[(w.x + w.width / 2 - s.x) / s.width, (w.y + w.height / 2 - s.y) / s.height];
```

Expected: both values within 0.47–0.53 (Email switch centered — Review Focus 5). Then toggle the site's theme to dark with the header's theme button: every stage surface, text and switch stays legible (Review Focus 4).

- [ ] **Step 7: Commit** (only after the owner says go)

```bash
git add apps/web/components/home/pull-back apps/web/app/page.tsx
git commit -m "feat(web): tell the home page's three sizes through one switch"
```

---

### Task 3: The camera move and its fallbacks

**Files:**
- Modify: `apps/web/components/home/pull-back/pull-back.css` — append the motion rules
- Create: `apps/web/components/home/pull-back/scale-fallback.tsx`
- Modify: `apps/web/components/home/pull-back/story.tsx` — render `<ScaleFallback />`

**Interfaces:**
- Consumes: the CSS hooks and ids from Task 2.
- Produces: `ScaleFallback()` — client component, renders `null`.

- [ ] **Step 1: Append the scroll-driven motion to `pull-back.css`**

```css
/* ---- Motion. The rules above are the finished, static state; everything below only animates it. ---- */

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .pb-world,
    .pb-ro-1,
    .pb-ro-2,
    .pb-ro-3,
    .pb-try {
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: --pb-story;
      animation-range: contain 0% contain 100%;
    }
    .pb-world { animation-name: pb-pull; }
    .pb-ro-1 { animation-name: pb-ro-1; }
    .pb-ro-2 { animation-name: pb-ro-2; }
    .pb-ro-3 { animation-name: pb-ro-3; }
    .pb-try { animation-name: pb-try; }
  }
}

@keyframes pb-pull {
  0%, 14% { transform: translate(-53.43em, -26.75em) scale(1); animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1); }
  36%, 50% { transform: translate(-7.086em, -2.217em) scale(0.228571); animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1); }
  74%, 100% { transform: translate(0, 0) scale(0.142857); }
}
@keyframes pb-ro-1 {
  0%, 24% { opacity: 1; background: var(--primary); color: var(--primary-foreground); }
  26%, 100% { opacity: 0.75; background: transparent; color: var(--foreground); }
}
@keyframes pb-ro-2 {
  0%, 24% { opacity: 0.75; background: transparent; color: var(--foreground); }
  26%, 60% { opacity: 1; background: var(--primary); color: var(--primary-foreground); }
  62%, 100% { opacity: 0.75; background: transparent; color: var(--foreground); }
}
@keyframes pb-ro-3 {
  0%, 60% { opacity: 0.75; background: transparent; color: var(--foreground); }
  62%, 100% { opacity: 1; background: var(--primary); color: var(--primary-foreground); }
}
@keyframes pb-try {
  0%, 12% { opacity: 1; }
  18%, 100% { opacity: 0; visibility: hidden; }
}

/* Fallback path (no scroll timelines, or reduced motion): ScaleFallback sets data-scale. Motion users
   get an eased move between framings; reduced-motion users get instant cuts. */
@media (prefers-reduced-motion: no-preference) {
  .pb-stage[data-fallback] .pb-world { transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1); }
}

/* A keyboard user on a switch that is outside the Primitive framing gets the Component framing, on
   every path, so focus never lands out of sight. */
.pb-stage:has(.pb-sw:not(#pb-sw-email):focus-visible) .pb-world {
  animation: none;
  transform: translate(-7.086em, -2.217em) scale(0.228571);
}
```

- [ ] **Step 2: Write `scale-fallback.tsx`**

```tsx
"use client";

import { useEffect } from "react";

/**
 * Only for browsers without scroll-driven animations, or with reduced motion: moves the stage between
 * its three framings as each story step reaches mid-screen. With scroll timelines and motion allowed,
 * it does nothing and CSS drives the camera.
 */
export function ScaleFallback() {
  useEffect(() => {
    const stage = document.getElementById("pb-stage");
    if (!stage) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeline = CSS.supports("animation-timeline: view()");
    if (timeline && !reduce) return;
    if (!("IntersectionObserver" in window)) return;

    stage.setAttribute("data-fallback", "");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const step = (entry.target as HTMLElement).dataset.step;
          if (entry.isIntersecting && step) stage.dataset.scale = step;
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const step of document.querySelectorAll(".pb-step")) observer.observe(step);
    return () => observer.disconnect();
  }, []);

  return null;
}
```

- [ ] **Step 3: Render it from `story.tsx`**

Add `import { ScaleFallback } from "./scale-fallback";` and render `<ScaleFallback />` as the last child of the `<section>`.

- [ ] **Step 4: Build, start, gate**

Same commands as Task 2 Step 5. Expected: the same PASS/FAIL set as Task 2 (motion adds no copy or headings).

- [ ] **Step 5: Keyboard check (Review Focus 1)**

In Chrome at `http://localhost:3456/`, scroll so the stage shows the Primitive framing, click the page just above the story, then press Tab until focus reaches the stage's switches. Expected: as soon as Company has focus, the stage shows the whole Public profile card; Space toggles it and the preview updates; Tab onward to Email keeps it visible.

- [ ] **Step 6: Phone check (Review Focus 2)**

DevTools device mode at 390 × 844. Expected: the readout pill sits under the stage (not over it); scrolling through the story passes through all three framings; in the console `document.documentElement.scrollWidth === innerWidth` is `true`.

- [ ] **Step 7: Fallback and reduced-motion check (Review Focus 3)**

- DevTools › Rendering › "Emulate CSS media feature prefers-reduced-motion: reduce", reload: the framings change as instant cuts when each step reaches mid-screen; `#pb-stage` has `data-fallback`.
- Open the page in Firefox (no `animation-timeline`): the framings ease between steps.
- DevTools › Settings › Debugger › "Disable JavaScript", reload in Firefox: the stage stays on the switch, every step's copy is readable, and the Email switch still updates the card preview.

- [ ] **Step 8: Commit** (only after the owner says go)

```bash
git add apps/web/components/home/pull-back
git commit -m "feat(web): pull the home page's camera back as the story scrolls"
```

---

### Task 4: The closing sections, the hero lede, and cleanup

**Files:**
- Modify: `apps/web/app/page.tsx`
- Modify: `apps/web/components/home/registry-data.ts`

**Interfaces:**
- Consumes: `Story` from Task 2.

- [ ] **Step 1: New hero lede**

Replace the hero's lede `<p>` body with:

```tsx
              <span className="tabular-nums">{primitiveCount}</span> accessible React primitives built on
              Base UI, composed into <span className="tabular-nums">{componentCount}</span> free components
              and <span className="tabular-nums">{catalog.blockCount}</span> Pro Blocks. The shadcn CLI copies
              the source into your repo.
```

- [ ] **Step 2: Replace "The file is yours." with the two closing sections**

Delete the whole `{/* Ownership: … */}` section and put these two sections in its place:

```tsx
      <section aria-labelledby="commands-title" className="border-b border-border">
        <div className={SECTION}>
          <h2 className={H2} id="commands-title">
            Same command at every size.
          </h2>
          <p className={`${LEAD} mt-4 max-w-[52ch]`}>
            A switch, a card, or a whole page. Each one arrives through the shadcn CLI as source in your repo,
            styled by the theme you already have.
          </p>
          <ul className="mt-10 divide-y divide-border border-y border-border">
            {sizes.map((size) => (
              <li
                className="grid grid-cols-1 gap-x-6 gap-y-3 py-5 md:grid-cols-[11rem_minmax(0,1fr)_auto] md:items-center"
                key={size.name}
              >
                <span className="font-semibold">
                  {size.name}
                  <span className="block text-[0.8125rem] font-normal text-muted-foreground">{size.terms}</span>
                </span>
                <InstallCommand className="min-w-0" commands={size.commands} label={`${size.name} install command`} />
                <Link className={QUIET_LINK} href={size.href}>
                  {size.linkLabel}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="start-title" className="border-b border-border">
        <div className={SECTION}>
          <h2 className={H2} id="start-title">
            Start at any size.
          </h2>
          <ul className="mt-10 divide-y divide-border border-y border-border">
            {doors.map((door) => (
              <li key={door.href}>
                <Link
                  className="group flex justify-between gap-4 py-5 text-lg font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                  href={door.href}
                >
                  <span className="group-hover:underline group-hover:underline-offset-4">{door.label}</span>
                  <span className="text-right text-[0.9375rem] font-normal text-muted-foreground">{door.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
```

And, where `tiers` used to be, define:

```tsx
  const sizes = [
    {
      name: "Primitive",
      terms: `${primitiveCount} · free, MIT`,
      commands: packageManagerCommands((pm) => installCommand("switch", pm)),
      href: "/docs/components/switch",
      linkLabel: "Switch docs",
    },
    {
      name: "Component",
      terms: `${componentCount} · free`,
      commands: packageManagerCommands((pm) => installCommand("component/switch-12", pm)),
      href: "/components",
      linkLabel: "Browse components",
    },
    {
      name: "Block",
      terms: `${catalog.blockCount} · Pro`,
      commands: packageManagerCommands((pm) => installCommand("pro/account-02", pm)),
      href: "/blocks",
      linkLabel: "Browse Blocks",
    },
  ];

  const doors = [
    { href: "/docs", label: "Read the installation guide", note: "Two minutes, one command" },
    { href: primitivesHref, label: "Browse the primitives", note: `${primitiveCount} single parts` },
    { href: "/components", label: "Browse free components", note: `${componentCount} composed examples` },
    { href: "/blocks", label: "See Pro Blocks", note: `${catalog.blockCount} finished sections and pages` },
  ];
```

- [ ] **Step 3: Remove what is now unused**

- In `app/page.tsx`, delete the imports `CodeFile`, `highlightLines`, and `sourceOf` (keep `componentCount`, `loadCatalog`, `primitiveCount`).
- In `components/home/registry-data.ts`, delete `sourceOf` and the `readFileSync`/`path` imports it alone used.
- Confirm nothing else used them: `grep -rn "sourceOf" apps/web` prints nothing.

- [ ] **Step 4: Typecheck, lint, build, gate with controls**

```bash
pnpm --filter @sevenui/web typecheck
pnpm exec biome lint apps/web/app/page.tsx apps/web/components/home scripts/check-home.mjs
kill $(lsof -tiTCP:3456 -sTCP:LISTEN) 2>/dev/null; PRO_MANIFEST_URL="$PWD/../sevenui-pro/dist/r/pro-manifest.json" pnpm build
cd apps/web && (pnpm exec next start -p 3456 &) && cd ../..
node scripts/check-home.mjs --base http://localhost:3456 --controls
```

Expected: 8 PASS, 8 LIVE, exit 0.

- [ ] **Step 5: Commit** (only after the owner says go)

```bash
git add apps/web/app/page.tsx apps/web/components/home/registry-data.ts
git commit -m "feat(web): close the home page with one command per size"
```

---

### Task 5: Whole-page verification

**Files:** none changed unless a check fails.

- [ ] **Step 1: The SEO gates stay green**

```bash
node scripts/route-inventory.mjs > /tmp/inv.json
node scripts/og-sweep.mjs --base http://localhost:3456 --inventory /tmp/inv.json
```

Expected: the same result as before this plan (every check PASS except the known "card ignoring the TITLE" witness finding). `/`'s title, description, canonical and OG tags are untouched.

- [ ] **Step 2: Lighthouse, mobile**

```bash
npx -y lighthouse@12 http://localhost:3456/ --quiet --only-categories=performance,seo --output=json --output-path=/tmp/lh-home.json --chrome-flags="--headless=new"
node -e 'const l=require("/tmp/lh-home.json"),a=l.audits;console.log(Object.fromEntries(Object.entries(l.categories).map(([k,v])=>[k,Math.round(v.score*100)])),a["largest-contentful-paint"].displayValue,a["cumulative-layout-shift"].displayValue,a["largest-contentful-paint-element"].details.items[0].items[0].node.snippet)'
```

Expected: performance ≥ 90 on localhost; CLS 0; the LCP element is a hero element (the slogan `<p>` or the lede), not anything inside `#pb-stage`.

- [ ] **Step 3: Mid-range Android memory check (spec risk)**

On a real mid-range Android (or Chrome DevTools › Performance with 4× CPU throttling and the "Layers" panel), scroll the story end to end. Expected: no dropped-frame bursts at the full pull-back. If there are, change `.pb-world`'s `font-size` to `calc(500cqi / 64)` and scale every translate value and scale factor in `pb-pull`, the `data-scale` rules and the focus rule by 5/7 (translates ×0.714; scales `0.228571 → 0.32`, `0.142857 → 0.2`), then repeat Task 2 Step 6's centering check.

- [ ] **Step 4: Report**

Tell the owner: gate output, og-sweep result, Lighthouse numbers, the three manual checks' outcomes (keyboard, phone, fallback), and anything that did not hold.
