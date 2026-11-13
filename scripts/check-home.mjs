#!/usr/bin/env node
// Asserts the home page's contract: the copy and structure it pins, what it may and may not claim, and how
// its two-flavour surface loads.
//
// The HTML checks read the server-rendered page (no JS runs, which is the point: a crawler and a no-JS
// visitor see exactly this), the stylesheets it links and the scripts it references. `--browser` adds checks
// in headless Chromium through Playwright, a root devDependency; PLAYWRIGHT_DIR optionally points at another
// install. Its browser downloads separately, once per machine: `pnpm exec playwright install chromium`.
// `--controls` breaks the input once per assertion and requires that assertion to fail, so a check that
// cannot fail is caught.

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseHTML } from "linkedom";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, i, all) => {
    if (arg === "--controls" || arg === "--browser") pairs.push([arg.slice(2), true]);
    else if (arg.startsWith("--") && all[i + 1] && !all[i + 1].startsWith("--")) pairs.push([arg.slice(2), all[i + 1]]);
    return pairs;
  }, []),
);
if (!args.base) {
  console.error("usage: check-home.mjs --base <url> [--manifest <path|url>] [--browser] [--controls]");
  process.exit(2);
}

// The two counts the page sets as headlines, derived here from the same sources the page reads, never typed
// in: the free components from the registry, the Pro blocks from the manifest the build under test loaded.
// That manifest is --manifest, else PRO_MANIFEST_URL (a path is relative to apps/web, as for the build), else
// the live one, the build's own default.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMPONENT_COUNT = JSON.parse(readFileSync(path.join(ROOT, "packages/registry/components/registry.json"), "utf8")).items.length;
const MANIFEST = args.manifest ?? process.env.PRO_MANIFEST_URL ?? "https://pro.sevenui.dev/r/pro-manifest.json";
const manifest = MANIFEST.startsWith("http")
  ? await (await fetch(MANIFEST)).json()
  : JSON.parse(readFileSync(path.resolve(ROOT, "apps/web", MANIFEST), "utf8"));
// Counted the way loadCatalog does: the items whose category belongs to a group.
const groupOf = new Map(manifest.categories.map((category) => [category.id, category.group]));
const groupIds = new Set(manifest.groups.map((group) => group.id));
const BLOCK_COUNT = manifest.items.filter((item) => groupIds.has(groupOf.get(item.category))).length;
const STAT_HEADINGS = {
  components: `${COMPONENT_COUNT} Components. Free to copy.`,
  // A count of zero is never set as a headline number.
  blocks: `${BLOCK_COUNT > 0 ? `${BLOCK_COUNT} ` : ""}${BLOCK_COUNT === 1 ? "Pro block." : "Pro blocks."} Sections and pages.`,
};

// The release the pill names. The page derives it from lib/roadmap.ts; this pins what it must come out as.
const RELEASE = "1.1";
const RELEASE_ANCHOR = "v1-1-0";

const H1 = "Own every primitive. Choose the foundation.";
const H1_MUTED = "Choose the foundation.";
const OUTLINE = [
  `h1 ${H1}`,
  "h2 Same code. Two foundations.",
  "h3 Base UI",
  "h3 UI SDK",
  `h2 ${STAT_HEADINGS.components}`,
  `h2 ${STAT_HEADINGS.blocks}`,
  "h2 Already speaks shadcn/ui.",
  "h3 The source is yours.",
  "h3 Your theme carries over.",
  "h3 Tested on both.",
  "h2 Two commands. Then it's yours.",
];
const HERO_COPY = [
  "Every primitive now also runs on UI SDK",
  "66 accessible primitives for shadcn/ui, installed as source.",
  "One API, on Base UI or UI SDK.",
];
// The honest trade-off each foundation's column states.
const FLAVOUR_COPY = [
  "Stable, the default",
  "Beta, from Vercel Labs",
  "@ui-sdk/react 0.1.0-beta.1, pinned",
  "React 19, and one CSS layer line",
];
const SURFACE_COPY = ["Releases", "Environments", "New release", "Saved carts", "Fix tax rounding on refunds", "Rolled back"];
const COMMANDS = [
  "@sevenui/button",
  "@sevenui/ui-sdk/button",
  "@sevenui/dialog",
  "@sevenui/ui-sdk/dialog",
  "shadcn@latest init --base base",
];
const LINKS = [
  "/docs",
  "/docs/components",
  "/docs/installation",
  "/docs/installation#choose-a-flavour",
  "/docs/theming",
  "/components",
  "/blocks",
  "/pro",
  `/roadmap#${RELEASE_ANCHOR}`,
];
// The page's one real (focusable, announced) flavour control; every other copy is an aria-hidden mirror.
const REAL_SWITCH = /role="radiogroup"[^>]*aria-label="Primitive flavour"|aria-label="Primitive flavour"[^>]*role="radiogroup"/g;
const TITLE = "SevenUI — Base UI components for shadcn/ui";
// Strings only UI SDK's runtime contains (its injected reset and guard styles); the flavour constants in the
// site's own code ("ui-sdk", ui-sdk.dev) never match.
const UI_SDK_RUNTIME = /ui-sdk-(scroll-guard|popover-reset|toast-defaults)/;

const text = (html) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
const visibleText = (html) =>
  text(
    html
      .replace(/<script\b[\s\S]*?<\/script>/g, "")
      .replace(/<style\b[\s\S]*?<\/style>/g, "")
      .replace(/<template\b[\s\S]*?<\/template>/g, ""),
  );

function outline(html) {
  return [...html.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/g)].map((m) => `${m[1]} ${text(m[2])}`);
}

// The site header and footer carry their own links and copy, so these checks read only <main>.
function mainHtml(html) {
  const start = html.indexOf("<main");
  const end = html.indexOf("</main>", start);
  return start === -1 || end === -1 ? "" : html.slice(start, end);
}

function surfaceHtml(html) {
  const start = html.search(/<figure\b[^>]*data-home-surface/);
  if (start === -1) return undefined;
  const end = html.indexOf("</figure>", start);
  return end === -1 ? undefined : html.slice(start, end);
}

function sectionHtml(html, id) {
  const start = html.search(new RegExp(`<section\\b[^>]*aria-labelledby="${id}"`));
  if (start === -1) return undefined;
  const end = html.indexOf("</section>", start);
  return end === -1 ? undefined : html.slice(start, end);
}

function mainHrefs(html) {
  return [...new Set([...mainHtml(html).matchAll(/href="(\/[^"#?]*)/g)].map((m) => m[1]))];
}

const scriptSrcs = (html) => [...new Set([...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+\.js)"/g)].map((m) => m[1]))];

const replaceDoc = (doc, patch) => ({ ...doc, ...patch });

const CHECKS = {
  outline: {
    name: `the heading outline is exactly the pinned ${OUTLINE.length} lines (one h1), with both counts derived`,
    run: ({ html }) => {
      const got = outline(html);
      return JSON.stringify(got) === JSON.stringify(OUTLINE) ? null : `got ${JSON.stringify(got)}`;
    },
    breakIt: (doc) => replaceDoc(doc, { html: doc.html.replace("</main>", "<h2>Stray</h2></main>") }),
  },
  h1Shape: {
    name: "the h1 is plain text plus one muted span for the second clause",
    run: ({ html }) => {
      const m = /<h1\b[^>]*>([\s\S]*?)<\/h1>/.exec(html);
      if (!m) return "no h1";
      const children = [...m[1].matchAll(/<([a-z][a-z0-9-]*)\b[^>]*>([\s\S]*?)<\/\1>/g)];
      const ok = children.length === 1 && children[0][1] === "span" && text(children[0][2]) === H1_MUTED;
      return ok && !/<(?!\/?span\b)/.test(m[1]) ? null : `h1 inner: ${m[1].slice(0, 160)}`;
    },
    breakIt: (doc) => replaceDoc(doc, { html: doc.html.replace(/(<h1\b[^>]*>)/, "$1<em>x</em>") }),
  },
  metadata: {
    name: "title, canonical, OG image and JSON-LD are unchanged",
    run: ({ html }) => {
      const problems = [];
      const title = /<title>([\s\S]*?)<\/title>/.exec(html)?.[1];
      if (text(title ?? "") !== TITLE) problems.push(`title ${JSON.stringify(title)}`);
      if (!/<link (?=[^>]*rel="canonical")(?=[^>]*href="https:\/\/sevenui\.dev\/")[^>]*>/.test(html)) problems.push("canonical");
      if (!/<meta property="og:image" content="[^"]+\/og\/index\.png"/.test(html)) problems.push("og:image");
      if (!/<script type="application\/ld\+json"/.test(html)) problems.push("json-ld");
      return problems.length ? `missing or wrong: ${problems.join(", ")}` : null;
    },
    breakIt: (doc) => replaceDoc(doc, { html: doc.html.replace(/<title>[\s\S]*?<\/title>/, "<title>x</title>") }),
  },
  heroCopy: {
    name: "the hero copy is in the server HTML",
    run: ({ html }) => {
      const flat = visibleText(mainHtml(html));
      const missing = HERO_COPY.filter((phrase) => !flat.includes(phrase));
      return missing.length ? `missing: ${missing.join(" | ")}` : null;
    },
    breakIt: (doc) => replaceDoc(doc, { html: doc.html.replaceAll("installed as source.", "installed.") }),
  },
  release: {
    name: `the release pill says ${RELEASE}, links to its roadmap entry, and no other version is claimed`,
    run: async ({ html, roadmap }) => {
      const main = mainHtml(html);
      const pill = new RegExp(`<a\\b[^>]*href="/roadmap#${RELEASE_ANCHOR}"[^>]*>([\\s\\S]*?)</a>`).exec(main);
      if (!pill) return `no link to /roadmap#${RELEASE_ANCHOR}`;
      const label = /<span\b[^>]*>([\s\S]*?)<\/span>/.exec(pill[1]);
      if (!label || text(label[1]) !== RELEASE) return `pill label ${JSON.stringify(label && text(label[1]))}`;
      if (!new RegExp(`id="${RELEASE_ANCHOR}"`).test(roadmap)) return `/roadmap has no #${RELEASE_ANCHOR}`;
      const stale = visibleText(main).match(/\bv2\b|\bversion 2\b/i);
      return stale ? `main claims another version: ${stale[0]}` : null;
    },
    breakIt: (doc) => replaceDoc(doc, { html: doc.html.replace(`href="/roadmap#${RELEASE_ANCHOR}"`, 'href="/roadmap#v9-9-0"') }),
  },
  surface: {
    name: "the live surface is a data-nosnippet figure, server-rendered on Base UI, with no heading and its real controls",
    run: ({ html }) => {
      const surface = surfaceHtml(html);
      if (!surface) return "no data-home-surface figure";
      if (!/data-nosnippet/.test(surface.slice(0, 300))) return "the figure lacks data-nosnippet";
      if (/<h[1-6]\b/.test(surface)) return "a heading inside the surface";
      if (!/data-preview-flavour="base-ui"/.test(surface)) return "the server render is not the Base UI preview";
      if (!/role="tablist"/.test(surface)) return "no tablist";
      const comboboxes = (surface.match(/role="combobox"/g) ?? []).length;
      if (comboboxes < 2) return `${comboboxes} comboboxes`;
      const flat = visibleText(surface);
      const missing = SURFACE_COPY.filter((phrase) => !flat.includes(phrase));
      return missing.length ? `missing: ${missing.join(" | ")}` : null;
    },
    breakIt: (doc) => replaceDoc(doc, { html: doc.html.replace(/(<figure\b[^>]*data-home-surface[^>]*>)/, "$1<h3>x</h3>") }),
  },
  oneRealSwitch: {
    name: "the page has one real flavour switch, in the live surface's toolbar, next to what it changes",
    run: ({ html }) => {
      const count = (mainHtml(html).match(REAL_SWITCH) ?? []).length;
      if (count !== 1) return `${count} real flavour switches in main`;
      return new RegExp(REAL_SWITCH.source).test(surfaceHtml(html) ?? "") ? null : "the real switch is not in the surface";
    },
    breakIt: (doc) =>
      replaceDoc(doc, { html: doc.html.replace("</main>", '<div role="radiogroup" aria-label="Primitive flavour"></div></main>') }),
  },
  flavourSection: {
    name: "the flavour section sets the two foundations side by side, each with its honest status, under a mirror switch",
    run: ({ html }) => {
      const section = sectionHtml(html, "flavours-title");
      if (!section) return "no flavour section";
      if (!/<div\b(?=[^>]*aria-hidden="true")(?=[^>]*class="flavour-switch\b)[^>]*>/.test(section)) return "no mirror flavour switch";
      // Each column carries the class home.css tints for the reader's flavour.
      for (const column of ["home-col-base-ui", "home-col-ui-sdk"]) {
        if (!new RegExp(`class="${column}\\b`).test(section)) return `no ${column} column`;
      }
      const flat = visibleText(section);
      const missing = FLAVOUR_COPY.filter((phrase) => !flat.includes(phrase));
      return missing.length ? `missing: ${missing.join(" | ")}` : null;
    },
    breakIt: (doc) => replaceDoc(doc, { html: doc.html.replaceAll("Beta, from Vercel Labs", "Stable") }),
  },
  proIsBaseUiOnly: {
    name: "no Pro block is offered in a UI SDK flavour",
    run: ({ html }) => {
      const main = mainHtml(html);
      if (/@sevenui\/ui-sdk\/pro\//.test(main)) return "a UI SDK pro install command";
      const blocks = sectionHtml(html, "blocks-title") ?? "";
      if (!blocks) return "no Blocks section";
      if (/flavour-only-/.test(blocks)) return "the Blocks section switches with the flavour";
      const flat = visibleText(blocks);
      if (!/\bPro blocks?\./.test(flat)) return "the Blocks section does not say Pro";
      return /Built on Base UI only/.test(flat) ? null : "the Blocks section does not say Base UI only";
    },
    breakIt: (doc) => replaceDoc(doc, { html: doc.html.replace("</main>", "<code>npx shadcn@latest add @sevenui/ui-sdk/pro/x</code></main>") }),
  },
  stats: {
    name: "Components and Blocks each get a section led by its count: the registry's exact count, the manifest's",
    run: ({ html }) => {
      const want = {
        components: { count: COMPONENT_COUNT, links: ["/components"] },
        blocks: { count: BLOCK_COUNT, links: ["/blocks", "/pro"] },
      };
      const order = [...mainHtml(html).matchAll(/<section\b[^>]*data-stat="([a-z]+)"/g)].map((m) => m[1]);
      if (order.join(",") !== "components,blocks") return `stat sections ${order.join(",") || "none"}`;
      for (const [id, { count, links }] of Object.entries(want)) {
        const section = sectionHtml(html, `${id}-title`) ?? "";
        const numbers = [...section.matchAll(/<span\b[^>]*data-stat-count[^>]*>([\s\S]*?)<\/span>/g)].map((m) => text(m[1]));
        // The number sits inside the h2, so it is read as part of the heading.
        const h2 = /<h2\b[^>]*>([\s\S]*?)<\/h2>/.exec(section)?.[1] ?? "";
        if (count > 0) {
          if (numbers.length !== 1 || numbers[0] !== String(count)) return `${id}: count ${JSON.stringify(numbers)}, want ${count}`;
          if (!/data-stat-count/.test(h2)) return `${id}: the count is not part of the heading`;
        } else if (numbers.length) return `${id}: a count of zero is set as ${JSON.stringify(numbers)}`;
        for (const href of links) if (!section.includes(`href="${href}"`)) return `${id} does not link to ${href}`;
      }
      return null;
    },
    breakIt: (doc) => replaceDoc(doc, { html: doc.html.replace(/(data-stat-count[^>]*>)[^<]*/, "$1900+") }),
  },
  noMcpClaim: {
    name: "the page makes no MCP claim",
    run: ({ html }) => (/\bMCP\b/.test(visibleText(mainHtml(html))) ? "main mentions MCP" : null),
    breakIt: (doc) => replaceDoc(doc, { html: doc.html.replace("</main>", "<p>SevenUI MCP server is live</p></main>") }),
  },
  commands: {
    name: "the install commands, in both flavours, are in the server HTML",
    run: ({ html }) => {
      const missing = COMMANDS.filter((command) => !html.includes(command));
      return missing.length ? `missing: ${missing.join(", ")}` : null;
    },
    breakIt: (doc) => replaceDoc(doc, { html: doc.html.replaceAll("@sevenui/ui-sdk/button", "@sevenui/x") }),
  },
  links: {
    name: "the internal links are real anchors inside <main>",
    run: ({ html }) => {
      const main = mainHtml(html);
      const missing = LINKS.filter((href) => !main.includes(`href="${href}"`));
      return missing.length ? `missing: ${missing.join(", ")}` : null;
    },
    breakIt: (doc) => replaceDoc(doc, { html: doc.html.replaceAll('href="/docs/theming"', 'href="/x"') }),
  },
  linksResolve: {
    name: "every internal link in <main> answers 200",
    run: async ({ html }) => {
      const bad = [];
      for (const href of mainHrefs(html)) {
        const res = await fetch(new URL(href, args.base), { redirect: "manual" });
        if (res.status !== 200) bad.push(`${href} -> ${res.status}`);
      }
      return bad.length ? bad.join(", ") : null;
    },
    breakIt: (doc) => replaceDoc(doc, { html: doc.html.replace("</main>", '<a href="/no-such-page-check-home">x</a></main>') }),
  },
  noUiSdkUpFront: {
    name: "no script the server HTML references contains UI SDK's runtime",
    run: ({ html, scripts }) => {
      const srcs = scriptSrcs(html);
      if (srcs.length < 5) return `only ${srcs.length} scripts referenced; the scan is not looking at the page`;
      const hits = srcs.filter((src) => UI_SDK_RUNTIME.test(scripts[src] ?? ""));
      const unread = srcs.filter((src) => scripts[src] === undefined);
      if (unread.length) return `unread scripts: ${unread.join(", ")}`;
      return hits.length ? `UI SDK in ${hits.join(", ")}` : null;
    },
    breakIt: (doc) => {
      const src = scriptSrcs(doc.html)[0];
      return replaceDoc(doc, { scripts: { ...doc.scripts, [src]: `${doc.scripts[src]}/*ui-sdk-popover-reset*/` } });
    },
  },
  reducedMotion: {
    name: "the home CSS turns its transitions off under prefers-reduced-motion",
    run: ({ css }) => {
      const blocks = [...css.matchAll(/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{([\s\S]*?\})\s*\}/g)];
      const ok = blocks.some((b) => /\.home-col-ui-sdk/.test(b[1]) && /transition:\s*none/.test(b[1]));
      return ok ? null : "no @media (prefers-reduced-motion: reduce) rule turning the .home-col transitions off";
    },
    breakIt: (doc) =>
      replaceDoc(doc, {
        css: doc.css.replaceAll("prefers-reduced-motion:reduce", "x").replaceAll("prefers-reduced-motion: reduce", "x"),
      }),
  },
  noOldSections: {
    name: "the previous landing's sections are gone",
    run: ({ html }) => {
      const flat = visibleText(mainHtml(html));
      const stale = [
        "Interfaces your agents can build.",
        "One registry, three sizes.",
        "Built for teams and their agents.",
        "Ask the agent…",
        "Start at any size.",
        // The first two-flavour home, before the spacing and copy pass.
        "Primitives for shadcn/ui, on Base UI or UI SDK.",
        "Start with a part, a pattern or a page.",
        "Nothing to depend on but your own files.",
        // The three-row tier index, before Components and Blocks got their own numbers.
        "Parts. Patterns. Pages.",
        "All of it installs with the shadcn CLI you already use.",
      ];
      const found = stale.filter((phrase) => flat.includes(phrase));
      return found.length ? `still rendered: ${found.join(" | ")}` : null;
    },
    breakIt: (doc) => replaceDoc(doc, { html: doc.html.replace("</main>", "<p>One registry, three sizes.</p></main>") }),
  },
  previewsWithoutScript: {
    // React's server renderer may send a Suspense boundary's content in a hidden element that a script
    // reveals; a live preview inside one is invisible without JavaScript. FlavouredPreview keeps its Base UI
    // preview out of any boundary until the reader picks UI SDK, on every page that uses it.
    name: "the home, a docs primitive and a gallery page server-render their Base UI previews outside hidden Suspense content",
    run: ({ previews }) => {
      const problems = [];
      for (const [path, page] of Object.entries(previews)) {
        const { document } = parseHTML(page);
        const all = [...document.querySelectorAll('[data-preview-flavour="base-ui"]')];
        const hidden = all.filter((el) => el.closest("[hidden], template"));
        const pending = (page.match(/<template id="B:/g) ?? []).length;
        if (all.length === 0) problems.push(`${path}: no Base UI preview in the server HTML`);
        else if (hidden.length) problems.push(`${path}: ${hidden.length} of ${all.length} Base UI previews are in hidden content`);
        if (pending) problems.push(`${path}: ${pending} Suspense boundaries left on their fallback`);
      }
      return problems.length ? problems.join("; ") : null;
    },
    breakIt: (doc) =>
      replaceDoc(doc, {
        previews: Object.fromEntries(
          Object.entries(doc.previews).map(([path, page]) => [
            path,
            page.replace('<div data-preview-flavour="base-ui">', '<div hidden id="S:99"><div data-preview-flavour="base-ui">'),
          ]),
        ),
      }),
  },
};

const response = await fetch(new URL("/", args.base));
if (!response.ok) {
  console.error(`GET / -> ${response.status}`);
  process.exit(1);
}
const html = await response.text();
const sheets = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map((m) => m[1]);
let css = "";
for (const href of sheets) css += await (await fetch(new URL(href, args.base))).text();
const scripts = {};
for (const src of scriptSrcs(html)) {
  const res = await fetch(new URL(src, args.base));
  if (res.ok) scripts[src] = await res.text();
}
const roadmap = await (await fetch(new URL("/roadmap", args.base))).text();
const previews = { "/": html };
for (const path of ["/docs/components/dialog", "/components/dialog"]) {
  previews[path] = await (await fetch(new URL(path, args.base))).text();
}
const doc = { html, css, scripts, roadmap, previews };

let failed = 0;
const report = (ok, name, problem) => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `\n      ${problem}`}`);
  if (!ok) failed++;
};

for (const check of Object.values(CHECKS)) {
  const problem = await check.run(doc);
  report(!problem, check.name, problem);
}

if (args.controls) {
  console.log("");
  for (const [key, check] of Object.entries(CHECKS)) {
    const broken = check.breakIt(doc);
    if (broken.html === doc.html && broken.css === doc.css && broken.scripts === doc.scripts && broken.previews === doc.previews) {
      console.log(`DEAD  ${key}: the control changed nothing`);
      failed++;
    } else if ((await check.run(broken)) === null) {
      console.log(`DEAD  ${key}: still passes on broken input`);
      failed++;
    } else {
      console.log(`LIVE  ${key}`);
    }
  }
}

if (args.browser) await browserChecks();

process.exit(failed ? 1 : 0);

async function loadPlaywright() {
  // An explicit PLAYWRIGHT_DIR wins over the workspace's own copy.
  if (process.env.PLAYWRIGHT_DIR) return createRequire(`${process.env.PLAYWRIGHT_DIR.replace(/\/?$/, "/")}`)("playwright");
  return await import("playwright");
}

// Each browser check gets a fresh page; `sabotage` is the control's way to break the page under test.
async function browserChecks() {
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch();
  const notes = new Set();
  const open = async ({ width = 360, flavour, javaScriptEnabled = true, sabotage, onScript } = {}) => {
    const context = await browser.newContext({ viewport: { width, height: 812 }, javaScriptEnabled });
    if (flavour) await context.addInitScript((f) => localStorage.setItem("sevenui:flavour", f), flavour);
    const page = await context.newPage();
    const errors = [];
    page.on("console", (m) => {
      if (m.type() !== "error") return;
      // A block cover is the Pro deployment's image, not this page's code; the fixture manifest names covers
      // that do not exist. Its failure is reported, not counted.
      const from = m.location()?.url ?? "";
      if (/^Failed to load resource/.test(m.text()) && /^https:\/\/pro\.sevenui\.dev\/assets\//.test(from)) {
        notes.add(`pro cover did not load: ${from}`);
        return;
      }
      errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(String(e)));
    if (onScript) {
      page.on("response", async (res) => {
        if (res.request().resourceType() === "script") onScript(res.url(), await res.text().catch(() => ""));
      });
    }
    await page.goto(new URL("/", args.base).href, { waitUntil: "networkidle" });
    if (sabotage) await page.evaluate(sabotage);
    await page.waitForTimeout(300);
    return { page, errors, close: () => context.close() };
  };
  const shownFlavour = (page) =>
    page.evaluate(() => document.querySelector("[data-home-surface] [data-preview-flavour]")?.getAttribute("data-preview-flavour"));

  const BROWSER = {
    noHorizontalScroll: {
      name: "no horizontal scroll at 360px",
      run: async (sabotage) => {
        const { page, close } = await open({ sabotage });
        const width = await page.evaluate(() => document.documentElement.scrollWidth);
        await close();
        return width <= 360 ? null : `scrollWidth ${width}`;
      },
      sabotage: () => {
        const wide = document.createElement("div");
        wide.style.width = "900px";
        wide.style.height = "1px";
        document.querySelector("main").append(wide);
      },
    },
    statsFit: {
      // The live manifest's count is three digits today; a four-digit one must still sit on one line at 360.
      name: "each headline count sits on one line inside the 16px gutter at 360px, as rendered and at four digits",
      run: async (sabotage) => {
        const { page, close } = await open({ sabotage });
        const problems = await page.evaluate((stress) => {
          const out = [];
          const counts = [...document.querySelectorAll("[data-stat-count]")];
          if (counts.length !== 2) out.push(`${counts.length} counts`);
          for (const value of [null, stress]) {
            for (const el of counts) {
              if (value) el.textContent = value;
              const box = el.getBoundingClientRect();
              const lineHeight = Number.parseFloat(getComputedStyle(el).fontSize);
              if (box.height > lineHeight * 1.2) out.push(`"${el.textContent}" wraps (${Math.round(box.height)}px)`);
              const range = document.createRange();
              range.selectNodeContents(el);
              const ink = range.getBoundingClientRect();
              if (ink.left < 16 || ink.right > window.innerWidth - 16) out.push(`"${el.textContent}" spans ${Math.round(ink.left)}–${Math.round(ink.right)}`);
            }
          }
          if (document.documentElement.scrollWidth > window.innerWidth) out.push(`scrollWidth ${document.documentElement.scrollWidth}`);
          return out;
        }, "9999");
        await close();
        return problems.length ? problems.join(" | ") : null;
      },
      sabotage: () => {
        for (const el of document.querySelectorAll("[data-stat-count]")) el.textContent = "99999999";
      },
    },
    noConsoleErrors: {
      name: "no console errors on load (desktop and phone, both flavours)",
      run: async (sabotage) => {
        const problems = [];
        for (const [width, flavour] of [
          [1440, "base-ui"],
          [360, "base-ui"],
          [1440, "ui-sdk"],
        ]) {
          const { page, errors, close } = await open({ width, flavour, sabotage });
          if (flavour === "ui-sdk") await page.waitForTimeout(1500);
          await close();
          problems.push(...errors);
        }
        return problems.length ? problems.slice(0, 3).join(" | ") : null;
      },
      sabotage: () => console.error("check-home control"),
    },
    baseUiLoadsNoUiSdk: {
      name: "a Base UI visitor loads no UI SDK code at all",
      run: async (_sabotage, flavour = "base-ui") => {
        const hits = [];
        const { page, close } = await open({ width: 1280, flavour, onScript: (url, body) => UI_SDK_RUNTIME.test(body) && hits.push(url) });
        await page.waitForTimeout(1500);
        await close();
        return hits.length ? `UI SDK loaded: ${hits.join(", ")}` : null;
      },
      // The control is a UI SDK visitor, who must load it.
      control: () => BROWSER.baseUiLoadsNoUiSdk.run(undefined, "ui-sdk"),
    },
    uiSdkSwapsIn: {
      name: "a UI SDK visitor gets the UI SDK surface, with no layout shift",
      run: async (_sabotage, flavour = "ui-sdk") => {
        const { page, close } = await open({ width: 1280, flavour });
        await page.evaluate(() => {
          window.__shift = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__shift += entry.value;
          }).observe({ type: "layout-shift", buffered: true });
        });
        await page.waitForTimeout(2500);
        const shown = await shownFlavour(page);
        const shift = await page.evaluate(() => window.__shift);
        await close();
        if (shown !== "ui-sdk") return `surface shows ${shown}`;
        return shift < 0.05 ? null : `layout shift ${shift.toFixed(3)}`;
      },
      control: () => BROWSER.uiSdkSwapsIn.run(undefined, "base-ui"),
    },
    uiSdkPopupFits: {
      // The Select and the date Popover are direct children of a Field in the dialog: UI SDK renders popups
      // in place, so unless the flavour moves them out, Field's `*:w-full` stretches them to the viewport.
      name: "on UI SDK the popups in the dialog's Fields size as on Base UI (select = trigger width, date popover = calendar)",
      run: async (sabotage) => {
        const { page, close } = await open({ width: 1280, flavour: "ui-sdk", sabotage });
        await page.waitForFunction(
          () => document.querySelector("[data-home-surface] [data-preview-flavour]")?.getAttribute("data-preview-flavour") === "ui-sdk",
          null,
          { timeout: 10000 },
        );
        const surface = page.locator("[data-home-surface]");
        await surface.getByRole("button", { name: "New release" }).click();
        const dialog = page.getByRole("dialog", { name: "New release" });
        await dialog.getByRole("combobox", { name: "Environment" }).click();
        await page.waitForTimeout(800);
        const select = await page.evaluate(() => {
          const content = document.querySelector('[data-slot="select-content"]:not([hidden])')?.getBoundingClientRect();
          const trigger = document.querySelector('[role="dialog"] [data-slot="select-trigger"]')?.getBoundingClientRect();
          return { content: content?.width ?? -1, trigger: trigger?.width ?? -1 };
        });
        await page.keyboard.press("Escape");
        await page.waitForTimeout(400);
        await dialog.getByRole("button", { name: /Nov 20/ }).click();
        await page.waitForTimeout(1200);
        const width = await page.evaluate(() => document.querySelector('[data-slot="popover-content"]')?.getBoundingClientRect().width ?? -1);
        await close();
        if (select.content < 0 || select.trigger < 0 || Math.abs(select.content - select.trigger) > 1) {
          return `select content ${select.content} for a ${select.trigger} trigger`;
        }
        return width > 0 && width < 400 ? null : `popover width ${width}`;
      },
      sabotage: () => {
        const style = document.createElement("style");
        style.textContent = '[data-slot="popover-content"],[data-slot="select-content"]{width:100vw!important}';
        document.head.append(style);
      },
    },
    plainActiveTab: {
      // The default-variant active tab is a plain pill: an inset shadow draws a bar along its bottom edge.
      name: "the planner's active tab carries no inset bar and no visible ::after (both flavours, dark)",
      run: async (sabotage) => {
        const problems = [];
        for (const flavour of ["base-ui", "ui-sdk"]) {
          const { page, close } = await open({ width: 1280, flavour, sabotage });
          await page.evaluate(() => {
            localStorage.setItem("theme", "dark");
            document.documentElement.setAttribute("data-theme", "dark");
          });
          if (flavour === "ui-sdk") {
            await page.waitForFunction(
              () => document.querySelector("[data-home-surface] [data-preview-flavour]")?.getAttribute("data-preview-flavour") === "ui-sdk",
              null,
              { timeout: 10000 },
            );
          }
          await page.waitForTimeout(400);
          const tab = await page.evaluate(() => {
            const el = document.querySelector('[data-home-surface] [role="tablist"][data-variant="default"] [role="tab"][data-active]');
            if (!el) return null;
            return { shadow: getComputedStyle(el).boxShadow, after: getComputedStyle(el, "::after").opacity };
          });
          await close();
          if (!tab) problems.push(`${flavour}: no active default-variant tab`);
          else if (/inset/.test(tab.shadow)) problems.push(`${flavour}: box-shadow ${tab.shadow}`);
          else if (tab.after !== "0") problems.push(`${flavour}: ::after opacity ${tab.after}`);
        }
        return problems.length ? problems.join(" | ") : null;
      },
      sabotage: () => {
        const style = document.createElement("style");
        style.textContent = '[role="tab"][data-active]{box-shadow:inset 0 -2px 0 currentColor!important}';
        document.head.append(style);
      },
    },
    noScript: {
      name: "without JavaScript the Base UI surface shows and the flavour switches are hidden",
      run: async (_sabotage, javaScriptEnabled = false) => {
        const { page, close } = await open({ width: 1280, javaScriptEnabled });
        const state = await page.evaluate(() => ({
          // The wrapper itself has no box (display: contents); the surface inside it does.
          surface: Boolean(
            document.querySelector('[data-home-surface] [data-preview-flavour="base-ui"]')?.firstElementChild?.getClientRects().length,
          ),
          rows: document.querySelector("[data-home-surface]")?.textContent.includes("Saved carts"),
          switches: [...document.querySelectorAll(".flavour-switch")].filter((el) => el.getClientRects().length > 0).length,
          label: [...document.querySelectorAll(".flavour-switch-static")].some((el) => el.getClientRects().length > 0),
        }));
        await close();
        if (!state.surface || !state.rows) return "the Base UI surface is not visible";
        if (state.switches) return `${state.switches} flavour switches visible`;
        return state.label ? null : "no static flavour label";
      },
      control: () => BROWSER.noScript.run(undefined, true),
    },
  };

  console.log("");
  for (const check of Object.values(BROWSER)) {
    const problem = await check.run();
    report(!problem, check.name, problem);
  }
  for (const note of notes) console.log(`NOTE  ${note}`);
  if (args.controls) {
    console.log("");
    for (const [key, check] of Object.entries(BROWSER)) {
      const problem = check.control ? await check.control() : await check.run(check.sabotage);
      console.log(problem ? `LIVE  ${key}` : `DEAD  ${key}: still passes on a broken page`);
      if (!problem) failed++;
    }
  }
  await browser.close();
}
