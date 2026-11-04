#!/usr/bin/env node
// Asserts the home page's contract (docs/superpowers/specs/2026-11-03-v2-landing-design.md).
//
// The HTML checks read the server-rendered page (no JS runs, which is the point: a crawler and a no-JS
// visitor see exactly this) plus the stylesheets it links. `--browser` adds checks in headless Chromium
// through Playwright, a root devDependency; PLAYWRIGHT_DIR optionally points at another install. Its
// browser downloads separately, once per machine: `pnpm exec playwright install chromium`. `--controls`
// breaks the input once per assertion and requires that assertion to fail, so a check that cannot fail is
// caught.

import { createRequire } from "node:module";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, i, all) => {
    if (arg === "--controls" || arg === "--browser") pairs.push([arg.slice(2), true]);
    else if (arg.startsWith("--") && all[i + 1] && !all[i + 1].startsWith("--")) pairs.push([arg.slice(2), all[i + 1]]);
    return pairs;
  }, []),
);
if (!args.base) {
  console.error("usage: check-home.mjs --base <url> [--browser] [--controls]");
  process.exit(2);
}

const H1 = "Base UI components for shadcn/ui";
const DISPLAY = "Interfaces your agents can build. Quality your users can feel.";
const DISPLAY_MUTED = "Quality your users can feel.";
const OUTLINE = [
  `h1 ${H1}`,
  `h2 ${DISPLAY}`,
  "h2 One registry, three sizes.",
  "h3 Primitive",
  "h3 Component",
  "h3 Block",
  "h2 Built for teams and their agents.",
  "h3 Set up the project",
  "h3 Choose the right part",
  "h3 Compose a page",
  "h2 Start with one command.",
];
const HERO_COPY = [
  "accessible primitives on Base UI, composed into",
  "components and Pro blocks. Copy the source, or let your agent assemble it.",
  "Works with",
  "Claude Code · Cursor · VS Code · Codex",
];
const FRAME_COPY = [
  "Acme Inc",
  "Allow agents to open PRs",
  "Comfortable",
  "Compact",
  "Cancel",
  "Save changes",
  "Add a danger zone with a delete-workspace dialog.",
  "Searched registry for alert-dialog",
  "Installed @sevenui/alert-dialog",
  "Composing settings/danger-zone.tsx",
  "Danger zone",
  "Ask the agent…",
];
const SIZE_LINKS = { primitive: "/docs/components", component: "/components", block: "/blocks" };
const COMMANDS = ["@sevenui/button", "@sevenui/switch", "@sevenui/component/switch-12", "@sevenui/pro/account-02"];
const LINKS = ["/docs", "/docs/components", "/docs/installation", "/components", "/blocks", "/pro", "/llms.txt"];
const TITLE = "SevenUI — Base UI components for shadcn/ui";

const text = (html) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
const visibleText = (html) => text(html.replace(/<script\b[\s\S]*?<\/script>/g, "").replace(/<style\b[\s\S]*?<\/style>/g, ""));

function outline(html) {
  return [...html.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/g)].map((m) => `${m[1]} ${text(m[2])}`);
}

// The site header and footer carry their own links and copy, so these checks read only <main>.
function mainHtml(html) {
  const start = html.indexOf("<main");
  const end = html.indexOf("</main>", start);
  return start === -1 || end === -1 ? "" : html.slice(start, end);
}

function frameHtml(html) {
  const start = html.search(/<figure\b[^>]*data-nosnippet/);
  if (start === -1) return undefined;
  const end = html.indexOf("</figure>", start);
  return end === -1 ? undefined : html.slice(start, end);
}

function sizeCards(html) {
  return [...html.matchAll(/<li\b[^>]*data-size-card="([a-z]+)"[^>]*>([\s\S]*?)<\/li>/g)].map((m) => ({
    name: m[1],
    html: m[2],
  }));
}

function mainHrefs(html) {
  return [...new Set([...mainHtml(html).matchAll(/href="(\/[^"#?]*)/g)].map((m) => m[1]))];
}

const replaceDoc = (doc, patch) => ({ ...doc, ...patch });

const CHECKS = {
  outline: {
    name: "the heading outline is exactly the spec's eleven lines (one h1)",
    run: ({ html }) => {
      const got = outline(html);
      return JSON.stringify(got) === JSON.stringify(OUTLINE) ? null : `got ${JSON.stringify(got)}`;
    },
    breakIt: (doc) => replaceDoc(doc, { html: doc.html.replace("</main>", "<h1>Stray</h1></main>") }),
  },
  h1Plain: {
    name: "the h1 is the SEO phrase as plain text",
    run: ({ html }) => {
      const m = /<h1\b[^>]*>([\s\S]*?)<\/h1>/.exec(html);
      if (!m) return "no h1";
      return !/</.test(m[1]) && text(m[1]) === H1 ? null : `h1 inner: ${m[1].slice(0, 160)}`;
    },
    breakIt: (doc) => replaceDoc(doc, { html: doc.html.replace(/(<h1\b[^>]*>)/, "$1<span>x</span>") }),
  },
  displayShape: {
    name: "the display line is the first h2: plain text plus one muted span for the second clause",
    run: ({ html }) => {
      const m = /<h2\b[^>]*>([\s\S]*?)<\/h2>/.exec(mainHtml(html));
      if (!m) return "no h2";
      const children = [...m[1].matchAll(/<([a-z][a-z0-9-]*)\b[^>]*>([\s\S]*?)<\/\1>/g)];
      const ok = children.length === 1 && children[0][1] === "span" && text(children[0][2]) === DISPLAY_MUTED;
      return ok && !/<(?!\/?span\b)/.test(m[1]) && text(m[1]) === DISPLAY ? null : `h2 inner: ${m[1].slice(0, 160)}`;
    },
    breakIt: (doc) => replaceDoc(doc, { html: doc.html.replace(DISPLAY_MUTED, "<em>x</em>") }),
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
    breakIt: (doc) => replaceDoc(doc, { html: doc.html.replaceAll("Works with", "Works") }),
  },
  frame: {
    name: "the product frame exists, carries data-nosnippet, holds no heading, and renders its finished state",
    run: ({ html }) => {
      const frame = frameHtml(html);
      if (!frame) return "no data-nosnippet figure";
      if (/<h[1-6]\b/.test(frame)) return "a heading inside the frame";
      if (!/data-density="comfortable"/.test(frame)) return "the frame does not carry data-density";
      const flat = visibleText(frame);
      const missing = FRAME_COPY.filter((phrase) => !flat.includes(phrase));
      return missing.length ? `missing: ${missing.join(" | ")}` : null;
    },
    breakIt: (doc) => replaceDoc(doc, { html: doc.html.replaceAll("Danger zone", "Zone") }),
  },
  reducedMotion: {
    name: "the frame's CSS has a reduced-motion path that stops its transitions",
    run: ({ css }) => {
      const blocks = [...css.matchAll(/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{([\s\S]*?\})\s*\}/g)];
      const ok = blocks.some((b) => /\.pf-reveal/.test(b[1]) && /transition:\s*none/.test(b[1]));
      return ok ? null : "no @media (prefers-reduced-motion: reduce) rule turning .pf-reveal transitions off";
    },
    breakIt: (doc) => replaceDoc(doc, { css: doc.css.replaceAll("prefers-reduced-motion:reduce", "x").replaceAll("prefers-reduced-motion: reduce", "x") }),
  },
  sizes: {
    name: "three size cards, each with its real render and its link",
    run: ({ html }) => {
      const cards = sizeCards(mainHtml(html));
      if (cards.length !== 3) return `${cards.length} size cards`;
      for (const card of cards) {
        const href = SIZE_LINKS[card.name];
        if (!href) return `unexpected card ${card.name}`;
        if (!card.html.includes(`href="${href}"`)) return `${card.name} does not link to ${href}`;
        if (!/role="switch"/.test(card.html)) return `${card.name} renders no real switch`;
      }
      return null;
    },
    breakIt: (doc) => replaceDoc(doc, { html: doc.html.replaceAll('href="/blocks"', 'href="/x"') }),
  },
  noMcpClaim: {
    name: "the page makes no MCP claim",
    run: ({ html }) => (/\bMCP\b/.test(visibleText(mainHtml(html))) ? "main mentions MCP" : null),
    breakIt: (doc) => replaceDoc(doc, { html: doc.html.replace("</main>", "<p>SevenUI MCP server is live</p></main>") }),
  },
  commands: {
    name: "the four install commands are in the server HTML",
    run: ({ html }) => {
      const missing = COMMANDS.filter((command) => !html.includes(command));
      return missing.length ? `missing: ${missing.join(", ")}` : null;
    },
    breakIt: (doc) => replaceDoc(doc, { html: doc.html.replaceAll("@sevenui/component/switch-12", "@sevenui/x") }),
  },
  links: {
    name: "the internal links are real anchors inside <main>",
    run: ({ html }) => {
      const main = mainHtml(html);
      const missing = LINKS.filter((href) => !main.includes(`href="${href}"`));
      return missing.length ? `missing: ${missing.join(", ")}` : null;
    },
    breakIt: (doc) => replaceDoc(doc, { html: doc.html.replaceAll('href="/llms.txt"', 'href="/x"') }),
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
  noOldSections: {
    name: "the removed Pull Back sections are gone",
    run: ({ html }) => {
      const flat = visibleText(mainHtml(html));
      const stale = ["Copy it. Own it. Ship it.", "Same command at every size.", "Start at any size.", "the public profile card"];
      const found = stale.filter((phrase) => flat.includes(phrase));
      return found.length ? `still rendered: ${found.join(" | ")}` : null;
    },
    breakIt: (doc) => replaceDoc(doc, { html: doc.html.replace("</main>", "<p>Start at any size.</p></main>") }),
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
const doc = { html, css };

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
    if (broken.html === doc.html && broken.css === doc.css) {
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
  const open = async ({ width = 375, reducedMotion = "no-preference", sabotage } = {}) => {
    const context = await browser.newContext({ viewport: { width, height: 812 }, reducedMotion });
    const page = await context.newPage();
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(new URL("/", args.base).href, { waitUntil: "networkidle" });
    if (sabotage) await page.evaluate(sabotage);
    await page.waitForTimeout(300);
    return { page, errors, close: () => context.close() };
  };
  const zoneOpacity = (page) =>
    page.evaluate(() => {
      const title = [...document.querySelectorAll("figure [data-slot=layer-card-title]")].find(
        (el) => el.textContent === "Danger zone",
      );
      const reveal = title?.closest(".pf-reveal");
      return reveal ? Number(getComputedStyle(reveal).opacity) : -1;
    });

  const BROWSER = {
    noHorizontalScroll: {
      name: "no horizontal scroll at 375px",
      run: async (sabotage) => {
        const { page, close } = await open({ sabotage });
        const width = await page.evaluate(() => document.documentElement.scrollWidth);
        await close();
        return width <= 375 ? null : `scrollWidth ${width}`;
      },
      sabotage: () => {
        const wide = document.createElement("div");
        wide.style.width = "900px";
        wide.style.height = "1px";
        document.querySelector("main").append(wide);
      },
    },
    noConsoleErrors: {
      name: "no console errors on load (desktop and phone)",
      run: async (sabotage) => {
        const problems = [];
        for (const width of [1440, 375]) {
          const { errors, close } = await open({ width, sabotage });
          await close();
          problems.push(...errors);
        }
        return problems.length ? problems.slice(0, 3).join(" | ") : null;
      },
      sabotage: () => console.error("check-home control"),
    },
    reducedMotionStatic: {
      name: "with reduced motion the finished frame shows at once, with no replay control",
      run: async (_sabotage, reducedMotion = "reduce") => {
        const { page, close } = await open({ reducedMotion });
        const opacity = await zoneOpacity(page);
        const replay = await page.locator('button[aria-label="Replay the agent demo"]').isVisible();
        await close();
        if (opacity !== 1) return `danger zone opacity ${opacity}`;
        return replay ? "the replay control is visible" : null;
      },
      // The control is the other preference: below the fold, the script has not run, so the zone is hidden.
      control: () => BROWSER.reducedMotionStatic.run(undefined, "no-preference"),
    },
    motionPlays: {
      name: "with motion allowed the script runs in view and ends on the finished frame",
      run: async (_sabotage, waitMs = 9000) => {
        const { page, close } = await open();
        const before = await zoneOpacity(page);
        await page.locator("figure[data-nosnippet]").scrollIntoViewIfNeeded();
        await page.waitForTimeout(waitMs);
        const after = await zoneOpacity(page);
        await close();
        if (before !== 0) return `danger zone opacity before the frame is in view: ${before}`;
        return after === 1 ? null : `danger zone opacity after the script: ${after}`;
      },
      // The control does not wait for the script, so the zone cannot have appeared yet.
      control: () => BROWSER.motionPlays.run(undefined, 0),
    },
  };

  console.log("");
  for (const check of Object.values(BROWSER)) {
    const problem = await check.run();
    report(!problem, check.name, problem);
  }
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
