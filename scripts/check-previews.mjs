#!/usr/bin/env node
// Asserts that a live preview lays out as its example would when installed: as the direct layout child of
// the preview frame ([data-sevenui-example]), in both flavours.
//
// FlavouredPreview wraps every example in a `data-preview-flavour` element (the hook for the pre-paint
// hiding CSS). A wrapper with a box of its own becomes the frame's grid item instead of the example, so
// `w-full`, `max-w-*` and `@container` roots resolve against a shrink-to-fit box: a container-query root
// collapsed to 0px wide. Each page below is opened in headless Chromium in both flavours, at a desktop and a
// phone width, and every preview is measured, unwrapped (the wrapper replaced by its children) and measured
// again in the same task, before anything can re-render: any example box that moves or resizes means the
// wrapper is not layout-transparent. A pinned expectation (the vertical tabs example fills its frame)
// guards the case on its own, and `--controls` gives the wrappers a box again and requires both to fail.
//
// usage: check-previews.mjs --base <url> [--controls]
// Playwright is a root devDependency; its browser downloads separately: `pnpm exec playwright install chromium`.

import { createRequire } from "node:module";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, i, all) => {
    if (arg === "--controls") pairs.push(["controls", true]);
    else if (arg.startsWith("--") && all[i + 1] && !all[i + 1].startsWith("--")) pairs.push([arg.slice(2), all[i + 1]]);
    return pairs;
  }, []),
);
if (!args.base) {
  console.error("usage: check-previews.mjs --base <url> [--controls]");
  process.exit(2);
}

// Pages whose examples depended on being the frame's direct child: container-query roots (tabs, card,
// empty, sidebar), `w-full max-w-*` roots (field, alert) and a chart sized by its parent; a docs page and
// the gallery are both covered, since they host previews in different shells.
const PAGES = ["/components/tabs", "/components/card", "/components/empty", "/components/field", "/docs/components/chart", "/docs/components/alert"];
const FLAVOURS = ["base-ui", "ui-sdk"];
const WIDTHS = [1280, 390];
const TOLERANCE = 0.5;
// The report's case: the vertical "Project view switcher" is an @container w-full root and must fill its frame.
const PINNED = { page: "/components/tabs", section: "tabs-02", minShare: 0.95 };
// The pre-fix state: the wrappers have a box again.
const BOX = "[data-preview-flavour]{display:block!important}";

async function loadPlaywright() {
  if (process.env.PLAYWRIGHT_DIR) return createRequire(`${process.env.PLAYWRIGHT_DIR.replace(/\/?$/, "/")}`)("playwright");
  return await import("playwright");
}

// A server started just before this script may still be booting.
for (let attempt = 0; ; attempt++) {
  const ok = await fetch(new URL("/", args.base)).then((r) => r.ok, () => false);
  if (ok) break;
  if (attempt === 60) {
    console.error(`${args.base} did not answer`);
    process.exit(1);
  }
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

const { chromium } = await loadPlaywright();
const browser = await chromium.launch();

async function measurePage(path, flavour, width, sabotage) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
  await context.addInitScript((f) => localStorage.setItem("sevenui:flavour", f), flavour);
  const page = await context.newPage();
  try {
    await page.goto(new URL(path, args.base).href, { waitUntil: "load" });
    if (sabotage) await page.addStyleTag({ content: sabotage });
    if (flavour === "ui-sdk") {
      // Every preview with a UI SDK version has swapped in; one still on Base UI is a failure below.
      await page
        .waitForFunction(() => !document.querySelector('[data-sevenui-example] [data-preview-flavour="base-ui"]'), null, { timeout: 20000 })
        .catch(() => {});
    }
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    return await page.evaluate((flavour) => {
      const frames = [...document.querySelectorAll("[data-sevenui-example]")];
      const previews = [];
      for (const frame of frames) {
        const wrapper = frame.querySelector(":scope > [data-preview-flavour]");
        const name = frame.closest("section[id]")?.id ?? `#${frames.indexOf(frame)}`;
        if (!wrapper) {
          // The one preview a UI SDK reader legitimately sees without a wrapper is the "no UI SDK version" note.
          previews.push({ name, shown: frame.firstElementChild?.tagName === "P" ? "none" : "missing" });
          continue;
        }
        const roots = [...wrapper.children].filter((el) => !["SCRIPT", "TEMPLATE", "STYLE"].includes(el.tagName));
        const box = (el) => {
          const f = frame.getBoundingClientRect();
          const b = el.getBoundingClientRect();
          return { x: b.left - f.left, y: b.top - f.top, w: b.width, h: b.height };
        };
        // Synchronous: getBoundingClientRect forces layout, and nothing re-renders between the two reads.
        const wrapped = roots.map(box);
        const frameWidth = frame.getBoundingClientRect().width;
        wrapper.replaceWith(...wrapper.childNodes);
        const direct = roots.map(box);
        previews.push({ name, shown: wrapper.getAttribute("data-preview-flavour"), wrapped, direct, frameWidth });
      }
      return { previews, flavour };
    }, flavour);
  } finally {
    await context.close();
  }
}

async function run(sabotage) {
  const problems = [];
  let measured = 0;
  for (const path of PAGES) {
    for (const flavour of FLAVOURS) {
      for (const width of WIDTHS) {
        const { previews } = await measurePage(path, flavour, width, sabotage);
        const where = `${path} ${flavour} ${width}px`;
        if (previews.length === 0) problems.push(`${where}: no previews`);
        for (const p of previews) {
          if (p.shown === "none") continue;
          if (p.shown !== flavour) {
            problems.push(`${where} ${p.name}: shows ${p.shown}`);
            continue;
          }
          if (p.wrapped.length === 0) problems.push(`${where} ${p.name}: empty wrapper`);
          measured++;
          p.wrapped.forEach((a, i) => {
            const b = p.direct[i];
            const off = ["x", "y", "w", "h"].filter((k) => Math.abs(a[k] - b[k]) > TOLERANCE);
            if (off.length) {
              problems.push(
                `${where} ${p.name}: the wrapper changes the example's box (${off.map((k) => `${k} ${a[k].toFixed(1)} vs ${b[k].toFixed(1)} direct`).join(", ")})`,
              );
            }
          });
          if (path === PINNED.page && p.name === PINNED.section) {
            const share = (p.wrapped[0]?.w ?? 0) / p.frameWidth;
            if (!(share >= PINNED.minShare)) {
              problems.push(`${where} ${p.name}: ${p.wrapped[0]?.w.toFixed(1)}px wide in a ${p.frameWidth.toFixed(1)}px frame`);
            }
          }
        }
      }
    }
  }
  // The domain: every page in both flavours must actually have been measured.
  if (measured < PAGES.length * FLAVOURS.length * WIDTHS.length) problems.push(`only ${measured} previews measured`);
  return { problems, measured };
}

let failed = 0;
const { problems, measured } = await run();
if (problems.length) {
  failed++;
  console.log(`FAIL  previews are layout-transparent (${problems.length} problems)`);
  for (const p of problems.slice(0, 20)) console.log(`      ${p}`);
} else {
  console.log(`PASS  previews are layout-transparent: ${measured} previews on ${PAGES.length} pages, both flavours, ${WIDTHS.join(" and ")}px`);
}

if (args.controls) {
  const broken = await run(BOX);
  const transparency = broken.problems.some((p) => p.includes("changes the example's box"));
  const pinned = broken.problems.some((p) => p.includes(PINNED.section) && p.includes("px wide in a"));
  console.log(transparency ? "LIVE  transparency" : "DEAD  transparency: still passes when the wrappers have a box");
  console.log(pinned ? "LIVE  pinned vertical tabs width" : "DEAD  pinned vertical tabs width: still passes when the wrappers have a box");
  if (!transparency || !pinned) failed++;
}

await browser.close();
process.exit(failed ? 1 : 0);
