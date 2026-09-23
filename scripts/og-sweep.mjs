#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const SITE = "https://sevenui.dev";

// §15.8's title suffix, and the em dash §17.6 #17 moved the docs titles to.
const SUFFIX = " — SevenUI";

const OG_TAGS = [
  "og:type",
  "og:site_name",
  "og:title",
  "og:description",
  "og:url",
  "og:image",
  "og:image:type",
  "og:image:width",
  "og:image:height",
  "og:image:alt",
];
const TWITTER_TAGS = ["twitter:card", "twitter:title", "twitter:description", "twitter:image", "twitter:image:alt"];
const CANONICAL = "link:canonical";
const FULL_TAG_SET = [...OG_TAGS, ...TWITTER_TAGS, CANONICAL];

const NOT_FOUND_TAG_SET = [
  "og:type",
  "og:site_name",
  "og:title",
  "og:description",
  "twitter:card",
  "twitter:title",
  "twitter:description",
];

function ogImagePath(route) {
  if (route === "/") return "/og/index.png";
  const segments = route.slice(1).split("/");
  segments[segments.length - 1] += ".png";
  return `/og/${segments.join("/")}`;
}

const BYTE_FLOOR = 8 * 1024;
const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;
const PNG_SIGNATURE = "89504e470d0a1a0a";

const TITLE_DRAW_CAP = 64;
const DESCRIPTION_DRAW_CAP = 160;

const OG_MISSES = [
  "/og/not-a-route.png",
  "/og/blocks/not-a-group.png",
  "/og/blocks/marketing/not-a-category.png",
  "/og/docs/components/not-a-primitive.png",
  "/og/index",
];

const MISSING_PAGES = [
  "/not-a-page", // the root miss
  "/docs/not-a-primitive", // the docs catch-all's miss branch
  "/components/not-a-component", // a gallery miss
  "/components/field", // §11.7's old target: it must still 404 rather than quietly becoming something
  "/blocks/not-a-group", // a `dynamicParams = true` group miss
  "/blocks/marketing/not-a-category", // §10's category `notFound()`
];

const SITE_DESCRIPTION = "Base UI powered primitives, distributed through the shadcn registry.";

const UNLISTED_PAGE_META = {
  "/": {
    title: "SevenUI",
    description: SITE_DESCRIPTION,
  },
  "/pro": {
    title: "Pro",
    description:
      "Pre-order SevenUI Pro for $99 lifetime — the price rises to $249 once the Pro blocks catalog launches.",
  },
  "/account": {
    title: "Account",
    description: SITE_DESCRIPTION,
  },
  "/terms": {
    title: "Terms of Service",
    description:
      "The terms that govern your use of the SevenUI website, the free component registry, and SevenUI Pro.",
  },
  "/privacy": {
    title: "Privacy Policy",
    description: "What personal data SevenUI collects, who processes it, and how to exercise your rights.",
  },
};

const GALLERY_CHILD = /^\/components\/[^/]+$/u;

function titleRuleFor(route) {
  if (route === "/") return "root-bare";
  if (GALLERY_CHILD.test(route)) return "gallery-components";
  return "suffixed";
}

function expectedTitle(route, registryTitle) {
  switch (titleRuleFor(route)) {
    case "root-bare":
      return registryTitle;
    case "gallery-components":
      return `${registryTitle} Components${SUFFIX}`;
    default:
      return `${registryTitle}${SUFFIX}`;
  }
}

function expectedPageUrl(route) {
  return route === "/" ? `${SITE}/` : `${SITE}${route}`;
}

const TAG = /<(meta|link)\b[^>]*>/giu;
const ATTR = /([a-zA-Z][\w:.-]*)\s*=\s*"([^"]*)"/gu;

const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0" };
function decodeEntities(text) {
  return text.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/gu, (whole, body) => {
    if (body.startsWith("#x") || body.startsWith("#X")) return String.fromCodePoint(Number.parseInt(body.slice(2), 16));
    if (body.startsWith("#")) return String.fromCodePoint(Number.parseInt(body.slice(1), 10));
    return NAMED[body.toLowerCase()] ?? whole;
  });
}

function readTags(fragment) {
  const found = [];
  for (const [whole, element] of fragment.matchAll(TAG)) {
    const attrs = {};
    for (const [, name, value] of whole.matchAll(ATTR)) attrs[name.toLowerCase()] = value;
    if (element.toLowerCase() === "link") {
      if ((attrs.rel ?? "").toLowerCase() === "canonical") {
        found.push({ key: CANONICAL, value: decodeEntities(attrs.href ?? "") });
      }
      continue;
    }
    const key = attrs.property ?? attrs.name;
    if (!key) continue;
    if (key.startsWith("og:") || key.startsWith("twitter:")) {
      found.push({ key, value: decodeEntities(attrs.content ?? "") });
    }
  }
  return found;
}

function splitHead(html) {
  const end = html.indexOf("</head>");
  if (end === -1) return { head: html, tail: "" };
  return { head: html.slice(0, end), tail: html.slice(end) };
}

const LLMS_ROW = /^- \[(.+)\]\((https:\/\/sevenui\.dev[^)]*)\): (.*)$/u;

function parseRegistry(text) {
  const byRoute = new Map();
  const duplicates = [];
  for (const line of text.split("\n")) {
    const match = LLMS_ROW.exec(line);
    if (!match) continue;
    const route = match[2].slice(SITE.length) || "/";
    if (byRoute.has(route)) duplicates.push(route);
    byRoute.set(route, { title: match[1], description: match[3] });
  }
  return { byRoute, duplicates };
}

// --- fetching ---------------------------------------------------------------

const bypass = process.env.VERCEL_BYPASS;
const headers = bypass ? { "x-vercel-protection-bypass": bypass } : {};

function fetchPath(base, pathname) {
  return fetch(`${base}${pathname}`, { headers, redirect: "manual" });
}

async function mapLimit(items, limit, worker) {
  let next = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      await worker(items[i]);
    }
  });
  await Promise.all(runners);
}

const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");

async function capture(base, routes, inventoryTotals) {
  const cards = {};
  const pages = {};
  let deployment;

  await mapLimit(routes, 8, async (route) => {
    const response = await fetchPath(base, route);
    pages[route] = { status: response.status, html: await response.text() };
    deployment ??= { xVercelId: response.headers.get("x-vercel-id"), sampledFrom: route };
  });

  const cardPaths = routes.map(ogImagePath);
  await mapLimit(cardPaths, 8, async (cardPath) => {
    const response = await fetchPath(base, cardPath);
    const body = Buffer.from(await response.arrayBuffer());
    cards[cardPath] = {
      status: response.status,
      contentType: (response.headers.get("content-type") ?? "").split(";")[0].trim(),
      byteLength: body.byteLength,
      head32: body.subarray(0, 32).toString("base64"),
      bodyHash: sha256(body),
    };
  });

  const llmsResponse = await fetchPath(base, "/llms.txt");
  const llms = { status: llmsResponse.status, text: await llmsResponse.text() };
  if (deployment) deployment.llmsEtag = llmsResponse.headers.get("etag");

  const misses = {};
  await mapLimit(OG_MISSES, 5, async (pathname) => {
    const response = await fetchPath(base, pathname);
    await response.arrayBuffer();
    misses[pathname] = { status: response.status };
  });

  const missingPages = {};
  await mapLimit(MISSING_PAGES, 3, async (pathname) => {
    const response = await fetchPath(base, pathname);
    missingPages[pathname] = { status: response.status, html: await response.text() };
  });

  return { base, routes, inventoryTotals, deployment, pages, cards, llms, misses, missingPages };
}

const CHECK = {
  cardStatus: "cards: every route's own card answers 200",
  cardType: "cards: every card is served as image/png",
  cardFloor: `cards: every card is larger than the ${BYTE_FLOOR} B floor`,
  cardSignature: "cards: every card body opens with the PNG signature",
  cardDimensions: `cards: every card's IHDR reports ${CARD_WIDTH}×${CARD_HEIGHT}`,
  cardWitnessTitle: "cards: the law has at least one witness that would catch a card ignoring the TITLE",
  cardWitnessDescription: "cards: the law has at least one witness that would catch a card ignoring the DESCRIPTION",
  cardWords: "cards: card bodies agree exactly where the page's words agree, and differ everywhere else",
  pageStatus: "pages: every route answers 200",
  tagSet: `pages: the declared tag set is exactly the ${OG_TAGS.length} og:*, the ${TWITTER_TAGS.length} twitter:* and the canonical link, each once`,
  tagPlacement: "pages: no og:*, twitter:* or canonical tag is emitted outside <head>",
  ownCard: "pages: og:image is the absolute form of the route's own card",
  cardProven: "pages: every route's og:image names a card layer 1 proved",
  pageUrl: "pages: og:url is the route's own absolute URL, with the trailing slash on / and on no other route",
  registryServed: "/llms.txt: answers 200",
  registryParsed: "/llms.txt: parses to at least one registry row",
  registryUnique: "/llms.txt: no route listed twice",
  coverage: "input diff: every route has a registry side — /llms.txt's row, or the literal restatement",
  coverageSingleSource: "input diff: no route is answered by both /llms.txt and the restatement",
  coverageNoStray: "input diff: every restated route is still in the inventory",
  descriptionDiff: "input diff: og:description is the registry's description for that route, byte for byte",
  titleDiff: "input diff: og:title is the registry's title under the route's own title rule (three rules, not one)",
  inventory: "inventory: the swept route lists and route-inventory.mjs's own total reconcile",
  ogMisses: `negative: all ${OG_MISSES.length} unknown card slugs answer 404, not a generated image`,
  notFoundStatus: "negative: every §17.4 missing page answers 404",
  notFoundComplete: `negative: every missing page declares all ${NOT_FOUND_TAG_SET.length} reduced tags`,
  notFoundNoExtras: "negative: no missing page declares a tag outside the reduced set",
  notFoundCard: "negative: every missing page's twitter:card is summary",
  notFoundPlacement: "negative: no missing page emits a tag outside <head>",
  notFoundOgTitle: "negative: every missing page's og:title is the suffixed 404 title (§17.6 #28)",
  notFoundTwitterTitle: "negative: every missing page's twitter:title is the suffixed 404 title (§17.6 #28)",
  notFoundOgDescription: "negative: every missing page's og:description is the site description",
  notFoundTwitterDescription: "negative: every missing page's twitter:description is the site description",
};

const RELATIONS = [
  { name: "og:title === og:image:alt", holds: (v) => v("og:title") === v("og:image:alt"), breaks: { key: "og:image:alt", value: "Not the title" } },
  { name: "og:title === twitter:title", holds: (v) => v("og:title") === v("twitter:title"), breaks: { key: "twitter:title", value: "Not the title" } },
  { name: "og:image:alt === twitter:image:alt", holds: (v) => v("og:image:alt") === v("twitter:image:alt"), breaks: { key: "twitter:image:alt", value: "Not the alt" } },
  { name: "og:description === twitter:description", holds: (v) => v("og:description") === v("twitter:description"), breaks: { key: "twitter:description", value: "Not the description" } },
  { name: "og:image === twitter:image", holds: (v) => v("og:image") === v("twitter:image"), breaks: { key: "twitter:image", value: `${SITE}/og/privacy.png` } },
  { name: "og:url === canonical", holds: (v) => v("og:url") === v(CANONICAL), breaks: { key: "og:url", value: `${SITE}/elsewhere` } },
  { name: "og:type === website", holds: (v) => v("og:type") === "website", breaks: { key: "og:type", value: "article" } },
  { name: "og:site_name === SevenUI", holds: (v) => v("og:site_name") === "SevenUI", breaks: { key: "og:site_name", value: "Seven UI" } },
  { name: "og:image:type === image/png", holds: (v) => v("og:image:type") === "image/png", breaks: { key: "og:image:type", value: "image/jpeg" } },
  { name: `og:image:width === ${CARD_WIDTH}`, holds: (v) => v("og:image:width") === String(CARD_WIDTH), breaks: { key: "og:image:width", value: "600" } },
  { name: `og:image:height === ${CARD_HEIGHT}`, holds: (v) => v("og:image:height") === String(CARD_HEIGHT), breaks: { key: "og:image:height", value: "315" } },
  { name: "twitter:card === summary_large_image", holds: (v) => v("twitter:card") === "summary_large_image", breaks: { key: "twitter:card", value: "summary" } },
];

const DECLARED_RELATIONS = [
  "og:title === og:image:alt",
  "og:title === twitter:title",
  "og:image:alt === twitter:image:alt",
  "og:description === twitter:description",
  "og:image === twitter:image",
  "og:url === canonical",
  "og:type === website",
  "og:site_name === SevenUI",
  "og:image:type === image/png",
  `og:image:width === ${CARD_WIDTH}`,
  `og:image:height === ${CARD_HEIGHT}`,
  "twitter:card === summary_large_image",
];

const DECLARED_CHECKS = [
  "cardStatus", "cardType", "cardFloor", "cardSignature", "cardDimensions",
  "cardWitnessTitle", "cardWitnessDescription", "cardWords",
  "pageStatus", "tagSet", "tagPlacement", "ownCard", "cardProven", "pageUrl",
  "registryServed", "registryParsed", "registryUnique",
  "coverage", "coverageSingleSource", "coverageNoStray",
  "descriptionDiff", "titleDiff", "inventory",
  "ogMisses",
  "notFoundStatus", "notFoundComplete", "notFoundNoExtras", "notFoundCard",
  "notFoundPlacement",
  "notFoundOgTitle", "notFoundTwitterTitle",
  "notFoundOgDescription", "notFoundTwitterDescription",
];

function requireSameSet(what, actual, declared) {
  const missing = declared.filter((name) => !actual.includes(name));
  const extra = actual.filter((name) => !declared.includes(name));
  if (missing.length || extra.length) {
    throw new Error(
      `${what} no longer matches the declared inventory in this file — refusing to run.\n` +
        (missing.length ? `  declared but absent: ${missing.join(" | ")}\n` : "") +
        (extra.length ? `  present but undeclared: ${extra.join(" | ")}\n` : "") +
        "  An assertion removed together with its control is invisible to a coverage claim computed\n" +
        "  from the code; this inventory is the independent copy that makes it visible. If the change\n" +
        "  is intended, edit the inventory deliberately and say why.",
    );
  }
}

requireSameSet("RELATIONS", RELATIONS.map((relation) => relation.name), DECLARED_RELATIONS);
requireSameSet("CHECK", Object.keys(CHECK), DECLARED_CHECKS);

// One assertion name per relation, so a control can name exactly one of them.
const relationCheck = (name) => `pages: self-consistency — ${name}`;

const NOT_FOUND_TITLE = `Page not found${SUFFIX}`;

// --- the checks -------------------------------------------------------------

function runChecks(cap, { verbose }) {
  const results = [];
  const notes = [];
  const record = (name, ok, detail) => results.push({ name, ok, detail });
  const routes = [...cap.routes].sort();
  const sample = (list, n = 4) => list.slice(0, n).join(" ;; ") + (list.length > n ? ` … +${list.length - n} more` : "");

  // --- Layer 1: the cards ---------------------------------------------------
  const cardOf = (route) => cap.cards[ogImagePath(route)] ?? {};

  const notOk = routes.filter((route) => cardOf(route).status !== 200);
  record(
    CHECK.cardStatus,
    notOk.length === 0,
    notOk.length ? sample(notOk.map((r) => `${ogImagePath(r)} -> ${cardOf(r).status}`)) : `${routes.length} cards, all 200`,
  );

  const wrongType = routes.filter((route) => cardOf(route).contentType !== "image/png");
  record(
    CHECK.cardType,
    wrongType.length === 0,
    wrongType.length
      ? sample(wrongType.map((r) => `${ogImagePath(r)} -> "${cardOf(r).contentType}"`))
      : "all image/png",
  );

  const tooSmall = routes.filter((route) => (cardOf(route).byteLength ?? 0) < BYTE_FLOOR);
  const sizes = routes.map((route) => cardOf(route).byteLength ?? 0);
  record(
    CHECK.cardFloor,
    tooSmall.length === 0,
    tooSmall.length
      ? sample(tooSmall.map((r) => `${ogImagePath(r)} -> ${cardOf(r).byteLength} B`))
      : `smallest ${Math.min(...sizes)} B, largest ${Math.max(...sizes)} B`,
  );

  const headerOf = (route) => Buffer.from(cardOf(route).head32 ?? "", "base64");
  const badSig = routes.filter((route) => headerOf(route).subarray(0, 8).toString("hex") !== PNG_SIGNATURE);
  record(
    CHECK.cardSignature,
    badSig.length === 0,
    badSig.length
      ? sample(badSig.map((r) => `${ogImagePath(r)} -> ${headerOf(r).subarray(0, 8).toString("hex")}`))
      : "all 8-byte signatures match",
  );

  const dimsOf = (route) => {
    const buffer = headerOf(route);
    if (buffer.length < 24 || buffer.subarray(12, 16).toString("ascii") !== "IHDR") return undefined;
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  };
  const badDims = routes.filter((route) => {
    const dims = dimsOf(route);
    return !dims || dims.width !== CARD_WIDTH || dims.height !== CARD_HEIGHT;
  });
  record(
    CHECK.cardDimensions,
    badDims.length === 0,
    badDims.length
      ? sample(
          badDims.map((r) => {
            const dims = dimsOf(r);
            return `${ogImagePath(r)} -> ${dims ? `${dims.width}×${dims.height}` : "no IHDR"}`;
          }),
        )
      : `all ${CARD_WIDTH}×${CARD_HEIGHT}`,
  );

  // --- the registry side, read before the card-content law needs it ----------
  const registry = parseRegistry(cap.llms.text);
  record(CHECK.registryServed, cap.llms.status === 200, `status ${cap.llms.status}`);
  record(
    CHECK.registryParsed,
    registry.byRoute.size > 0,
    registry.byRoute.size > 0 ? `${registry.byRoute.size} rows parsed` : "0 rows parsed — nothing to diff against",
  );
  record(
    CHECK.registryUnique,
    registry.duplicates.length === 0,
    registry.duplicates.length ? sample(registry.duplicates) : "no route listed twice",
  );

  const metaFor = (route) => registry.byRoute.get(route) ?? UNLISTED_PAGE_META[route];
  const uncovered = routes.filter((route) => !metaFor(route));

  const overCap = [];
  let longestTitle = 0;
  let longestDescription = 0;
  for (const route of routes) {
    const meta = metaFor(route);
    if (!meta) continue;
    const titleLength = [...meta.title].length;
    const descriptionLength = [...meta.description].length;
    longestTitle = Math.max(longestTitle, titleLength);
    longestDescription = Math.max(longestDescription, descriptionLength);
    if (titleLength > TITLE_DRAW_CAP) overCap.push({ route, why: `title ${titleLength}>${TITLE_DRAW_CAP}` });
    else if (descriptionLength > DESCRIPTION_DRAW_CAP) {
      overCap.push({ route, why: `description ${descriptionLength}>${DESCRIPTION_DRAW_CAP}` });
    }
  }
  const excluded = new Set(overCap.map((entry) => entry.route));
  notes.push(
    `NOTE  cards: draw-cap headroom — longest title ${longestTitle}/${TITLE_DRAW_CAP}, ` +
      `longest description ${longestDescription}/${DESCRIPTION_DRAW_CAP} code points. ` +
      (overCap.length
        ? `${overCap.length} route(s) EXCLUDED from the card-content law (the drawn text is truncated, ` +
          `so it is no longer the registry text): ${overCap.map((e) => `${e.route} (${e.why})`).join(" ;; ")}`
        : "0 routes excluded from the card-content law."),
  );

  const inLaw = routes.filter((route) => metaFor(route) && !excluded.has(route));
  const groups = new Map();
  for (const route of inLaw) {
    const meta = metaFor(route);
    const key = JSON.stringify([meta.title, meta.description]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(route);
  }
  const describe = (route) => {
    const meta = metaFor(route);
    return `${route} title=${JSON.stringify(meta?.title)} description=${JSON.stringify(meta?.description)}`;
  };
  const wordProblems = [];
  // Within a group: same words, so the same card must have been drawn.
  for (const [, members] of groups) {
    const hashes = new Set(members.map((route) => cardOf(route).bodyHash));
    if (hashes.size > 1) {
      wordProblems.push(
        `same words, different cards: ${members.map((r) => `${r}=${(cardOf(r).bodyHash ?? "").slice(0, 12)}`).join(" ")} | ${describe(members[0])}`,
      );
    }
  }
  const byHash = new Map();
  for (const [key, members] of groups) {
    const hash = cardOf(members[0]).bodyHash;
    if (!byHash.has(hash)) byHash.set(hash, []);
    byHash.get(hash).push({ key, members });
  }
  for (const [hash, colliding] of byHash) {
    if (colliding.length < 2) continue;
    wordProblems.push(
      `different words, same card (${(hash ?? "").slice(0, 12)}): ${colliding
        .slice(0, 3)
        .map((group) => describe(group.members[0]))
        .join(" ;; ")}${colliding.length > 3 ? ` … +${colliding.length - 3} more groups on this hash` : ""}`,
    );
  }
  const skipNote = uncovered.length ? `, ${uncovered.length} skipped for want of a registry side` : "";
  record(
    CHECK.cardWords,
    wordProblems.length === 0,
    wordProblems.length
      ? sample(wordProblems, 3)
      : `${groups.size} distinct {title, description} groups over ${inLaw.length} routes, ` +
        `${byHash.size} distinct card bodies${skipNote}` +
        (excluded.size
          ? `, ${excluded.size} excluded for reaching a draw cap: ${[...excluded].join(" ")}`
          : ", 0 excluded for a draw cap"),
  );

  const witnessPairs = (same, other) => {
    const buckets = new Map();
    for (const route of inLaw) {
      const meta = metaFor(route);
      const key = meta[same];
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(route);
    }
    const found = [];
    for (const [key, members] of buckets) {
      if (members.length < 2) continue;
      const distinct = new Set(members.map((route) => metaFor(route)[other]));
      if (distinct.size > 1) found.push({ key, members });
    }
    return found;
  };
  // Share a DESCRIPTION, differ in title -> catches a card ignoring the title.
  const titleWitnesses = witnessPairs("description", "title");
  record(
    CHECK.cardWitnessTitle,
    titleWitnesses.length > 0,
    titleWitnesses.length
      ? `${titleWitnesses.length} witness group(s), e.g. ${titleWitnesses[0].members.join(" vs ")}`
      : "NONE — no two routes share a description, so a card that never drew the title would pass this law",
  );
  // Share a TITLE, differ in description -> catches a card ignoring the description.
  const descriptionWitnesses = witnessPairs("title", "description");
  record(
    CHECK.cardWitnessDescription,
    descriptionWitnesses.length > 0,
    descriptionWitnesses.length
      ? `${descriptionWitnesses.length} witness group(s), e.g. ${descriptionWitnesses[0].members.join(" vs ")}`
      : "NONE — no two routes share a title, so a card that never drew the description would pass this law",
  );

  // --- Layer 2: the tag set -------------------------------------------------
  const badPage = routes.filter((route) => cap.pages[route]?.status !== 200);
  record(
    CHECK.pageStatus,
    badPage.length === 0,
    badPage.length ? sample(badPage.map((r) => `${r} -> ${cap.pages[r]?.status}`)) : `${routes.length} pages, all 200`,
  );

  const split = new Map(routes.map((route) => [route, splitHead(cap.pages[route]?.html ?? "")]));
  const tagsOf = new Map(routes.map((route) => [route, readTags(split.get(route).head)]));
  const valueOf = (route, key) => tagsOf.get(route)?.find((tag) => tag.key === key)?.value;

  const wrongSet = [];
  for (const route of routes) {
    const keys = tagsOf.get(route).map((tag) => tag.key);
    const missing = FULL_TAG_SET.filter((key) => !keys.includes(key));
    const extra = keys.filter((key) => !FULL_TAG_SET.includes(key));
    const repeated = keys.filter((key, i) => keys.indexOf(key) !== i);
    if (missing.length || extra.length || repeated.length) {
      wrongSet.push(`${route}: missing=[${missing}] extra=[${extra}] repeated=[${[...new Set(repeated)]}]`);
    }
  }
  record(
    CHECK.tagSet,
    wrongSet.length === 0,
    wrongSet.length ? sample(wrongSet) : `${routes.length} routes at ${FULL_TAG_SET.length} tags each`,
  );

  const leaked = routes.filter((route) => readTags(split.get(route).tail).length > 0);
  record(
    CHECK.tagPlacement,
    leaked.length === 0,
    leaked.length
      ? sample(leaked.map((r) => `${r} -> ${readTags(split.get(r).tail).length} tags after </head>`))
      : "0 leaks",
  );

  for (const relation of RELATIONS) {
    const broken = routes.filter((route) => !relation.holds((key) => valueOf(route, key)));
    record(
      relationCheck(relation.name),
      broken.length === 0,
      broken.length
        ? sample(broken.map((r) => `${r}: ${JSON.stringify(valueOf(r, relation.breaks.key))}`))
        : `holds on ${routes.length} routes`,
    );
  }

  const wrongImage = [];
  const unproven = [];
  for (const route of routes) {
    const want = `${SITE}${ogImagePath(route)}`;
    const got = valueOf(route, "og:image");
    if (got !== want) wrongImage.push(`${route}: want ${want} got ${got}`);
    if (cap.cards[ogImagePath(route)]?.status !== 200) unproven.push(`${route} -> ${ogImagePath(route)}`);
  }
  record(
    CHECK.ownCard,
    wrongImage.length === 0,
    wrongImage.length ? sample(wrongImage) : `${routes.length} routes point at their own card`,
  );
  record(
    CHECK.cardProven,
    unproven.length === 0,
    unproven.length ? sample(unproven) : `every route's og:image is a card layer 1 proved`,
  );

  const wrongUrl = routes.filter((route) => valueOf(route, "og:url") !== expectedPageUrl(route));
  record(
    CHECK.pageUrl,
    wrongUrl.length === 0,
    wrongUrl.length
      ? sample(wrongUrl.map((r) => `${r}: want ${expectedPageUrl(r)} got ${valueOf(r, "og:url")}`))
      : `/ -> ${valueOf("/", "og:url")}`,
  );

  const fromRegistry = routes.filter((route) => registry.byRoute.has(route));
  const fromLiterals = routes.filter((route) => !registry.byRoute.has(route) && UNLISTED_PAGE_META[route]);
  const doubleSourced = Object.keys(UNLISTED_PAGE_META).filter((route) => registry.byRoute.has(route));
  const strayLiterals = Object.keys(UNLISTED_PAGE_META).filter((route) => !routes.includes(route));
  record(
    CHECK.coverage,
    uncovered.length === 0,
    uncovered.length
      ? `UNCOVERED: ${sample(uncovered)}`
      : `${fromRegistry.length} routes from /llms.txt, ${fromLiterals.length} from the restatement (${fromLiterals.join(" ")})`,
  );
  record(
    CHECK.coverageSingleSource,
    doubleSourced.length === 0,
    doubleSourced.length ? `double-sourced: ${sample(doubleSourced)}` : "no route answered by both sides",
  );
  record(
    CHECK.coverageNoStray,
    strayLiterals.length === 0,
    strayLiterals.length ? `restated but not a route: ${sample(strayLiterals)}` : "every restated route is in the inventory",
  );

  const wrongDescription = [];
  for (const route of routes) {
    const meta = metaFor(route);
    if (!meta) continue; // already a failure on the coverage check; never silently skipped
    const got = valueOf(route, "og:description");
    if (got !== meta.description) {
      wrongDescription.push(
        `${route}: registry ${JSON.stringify(meta.description)} vs page ${JSON.stringify(got)}`,
      );
    }
  }
  record(
    CHECK.descriptionDiff,
    wrongDescription.length === 0,
    wrongDescription.length
      ? sample(wrongDescription, 3)
      : `${routes.length - uncovered.length} routes compared${skipNote}`,
  );

  const wrongTitle = [];
  const ruleCounts = { "root-bare": 0, "gallery-components": 0, suffixed: 0 };
  for (const route of routes) {
    const meta = metaFor(route);
    if (!meta) continue;
    ruleCounts[titleRuleFor(route)] += 1;
    const want = expectedTitle(route, meta.title);
    const got = valueOf(route, "og:title");
    if (got !== want) {
      wrongTitle.push(`${route} [${titleRuleFor(route)}]: want ${JSON.stringify(want)} got ${JSON.stringify(got)}`);
    }
  }
  record(
    CHECK.titleDiff,
    wrongTitle.length === 0,
    wrongTitle.length
      ? sample(wrongTitle, 3)
      : `root-bare ${ruleCounts["root-bare"]}, gallery-components ${ruleCounts["gallery-components"]}, ` +
        `suffixed ${ruleCounts.suffixed}${skipNote}`,
  );

  const totals = cap.inventoryTotals;
  record(
    CHECK.inventory,
    Boolean(totals) && routes.length + totals.notFound === totals.total,
    totals
      ? `swept ${routes.length} + notFound ${totals.notFound} = ${routes.length + totals.notFound}, inventory total ${totals.total}`
      : "no inventory totals in the capture",
  );

  // --- Layer 3: the negative paths -----------------------------------------
  const liveMisses = OG_MISSES.filter((pathname) => cap.misses[pathname]?.status !== 404);
  record(
    CHECK.ogMisses,
    liveMisses.length === 0,
    liveMisses.length
      ? sample(liveMisses.map((p) => `${p} -> ${cap.misses[p]?.status}`))
      : OG_MISSES.map((p) => `${p} 404`).join(" ;; "),
  );

  const captured = MISSING_PAGES.map((pathname) => {
    const page = cap.missingPages[pathname];
    const { head, tail } = splitHead(page?.html ?? "");
    const tags = readTags(head);
    return {
      pathname,
      page,
      keys: tags.map((tag) => tag.key),
      value: (key) => tags.find((tag) => tag.key === key)?.value,
      outside: readTags(tail).length,
    };
  });
  const notFoundAssert = (name, predicate, describe, okDetail) => {
    const bad = captured.filter((entry) => !entry.page || !predicate(entry));
    record(
      name,
      bad.length === 0,
      bad.length ? sample(bad.map((entry) => (entry.page ? describe(entry) : `${entry.pathname}: not captured`))) : okDetail,
    );
  };

  notFoundAssert(
    CHECK.notFoundStatus,
    (e) => e.page.status === 404,
    (e) => `${e.pathname}: status ${e.page.status}`,
    MISSING_PAGES.map((p) => `${p} 404`).join(" ;; "),
  );
  notFoundAssert(
    CHECK.notFoundComplete,
    (e) => NOT_FOUND_TAG_SET.every((key) => e.keys.includes(key)),
    (e) => `${e.pathname}: missing=[${NOT_FOUND_TAG_SET.filter((key) => !e.keys.includes(key))}]`,
    `all ${NOT_FOUND_TAG_SET.length} reduced tags present on every missing page`,
  );
  notFoundAssert(
    CHECK.notFoundNoExtras,
    (e) => e.keys.every((key) => NOT_FOUND_TAG_SET.includes(key)),
    (e) => `${e.pathname}: extra=[${e.keys.filter((key) => !NOT_FOUND_TAG_SET.includes(key))}]`,
    "no og:url, no og:image, no canonical on any missing page",
  );
  notFoundAssert(
    CHECK.notFoundCard,
    (e) => e.value("twitter:card") === "summary",
    (e) => `${e.pathname}: twitter:card=${JSON.stringify(e.value("twitter:card"))}`,
    'twitter:card="summary" everywhere',
  );
  notFoundAssert(
    CHECK.notFoundPlacement,
    (e) => e.outside === 0,
    (e) => `${e.pathname}: ${e.outside} tags outside <head>`,
    "0 leaks",
  );
  for (const [check, key, want, label] of [
    [CHECK.notFoundOgTitle, "og:title", NOT_FOUND_TITLE, JSON.stringify(NOT_FOUND_TITLE)],
    [CHECK.notFoundTwitterTitle, "twitter:title", NOT_FOUND_TITLE, JSON.stringify(NOT_FOUND_TITLE)],
    [CHECK.notFoundOgDescription, "og:description", SITE_DESCRIPTION, "the site description"],
    [CHECK.notFoundTwitterDescription, "twitter:description", SITE_DESCRIPTION, "the site description"],
  ]) {
    notFoundAssert(
      check,
      (e) => e.value(key) === want,
      (e) => `${e.pathname}: ${key}=${JSON.stringify(e.value(key))}`,
      `${key} = ${label}`,
    );
  }

  if (verbose) {
    for (const route of routes) {
      const meta = metaFor(route);
      notes.push(
        `${route}\n    rule=${titleRuleFor(route)} source=${registry.byRoute.has(route) ? "llms.txt" : "restatement"}` +
          `\n    card=${ogImagePath(route)} ${cardOf(route).status} ${cardOf(route).byteLength} B ` +
          `sha256=${(cardOf(route).bodyHash ?? "").slice(0, 16)}` +
          `\n    og:title=${JSON.stringify(valueOf(route, "og:title"))} want=${JSON.stringify(meta ? expectedTitle(route, meta.title) : undefined)}`,
      );
    }
  }

  return { results, notes };
}

const PERTURB = {
  // --- layer 1 --------------------------------------------------------------
  cardstatus: {
    target: CHECK.cardStatus,
    apply: (cap) => {
      const cardPath = firstCard(cap);
      const empty = Buffer.alloc(0);
      cap.cards[cardPath] = {
        status: 404,
        contentType: "text/plain",
        byteLength: 0,
        head32: empty.toString("base64"),
        bodyHash: sha256(empty),
      };
      return `${cardPath} -> 404 with an empty body`;
    },
  },
  cardtype: {
    target: CHECK.cardType,
    apply: (cap) => {
      const cardPath = firstCard(cap);
      cap.cards[cardPath].contentType = "image/webp";
      return `${cardPath} content-type -> image/webp`;
    },
  },
  cardbytes: {
    target: CHECK.cardFloor,
    apply: (cap) => {
      const cardPath = firstCard(cap);
      cap.cards[cardPath].byteLength = 1024;
      return `${cardPath} byteLength -> 1024`;
    },
  },
  cardsig: {
    target: CHECK.cardSignature,
    apply: (cap) => {
      const cardPath = firstCard(cap);
      const buffer = Buffer.from(cap.cards[cardPath].head32, "base64");
      buffer[1] = 0x00;
      cap.cards[cardPath].head32 = buffer.toString("base64");
      return `${cardPath} PNG signature byte 1 -> 0x00`;
    },
  },
  cardsize: {
    target: CHECK.cardDimensions,
    apply: (cap) => {
      const cardPath = firstCard(cap);
      const buffer = Buffer.from(cap.cards[cardPath].head32, "base64");
      buffer.writeUInt32BE(1201, 16);
      cap.cards[cardPath].head32 = buffer.toString("base64");
      return `${cardPath} IHDR width -> 1201`;
    },
  },
  cardwordscollapse: {
    target: CHECK.cardWords,
    apply: (cap) => {
      const routes = [...cap.routes].sort();
      const one = cap.cards[ogImagePath(routes[0])]?.bodyHash;
      if (!one) return undefined;
      for (const route of routes) {
        const card = cap.cards[ogImagePath(route)];
        if (card) card.bodyHash = one;
      }
      return `every card body collapsed onto one hash (${one.slice(0, 12)})`;
    },
  },
  cardwordsgroup: {
    target: CHECK.cardWords,
    apply: (cap) => {
      const registry = parseRegistry(cap.llms.text);
      const privacy = registry.byRoute.get("/privacy") ?? UNLISTED_PAGE_META["/privacy"];
      const before = cap.llms.text;
      cap.llms.text = `${before.trimEnd()}\n- [${privacy.title}](${SITE}/terms): ${privacy.description}\n`;
      if (cap.llms.text === before) return undefined;
      return "/llms.txt: /terms given /privacy's exact words, putting two differently-drawn cards in one group";
    },
  },
  // --- layer 2 --------------------------------------------------------------
  pagestatus: {
    target: CHECK.pageStatus,
    apply: (cap) => {
      const route = firstRoute(cap);
      cap.pages[route] = { status: 500, html: "<html><head><title>500</title></head><body></body></html>" };
      return `${route} -> 500 with an error body`;
    },
  },
  tagdrop: {
    target: CHECK.tagSet,
    apply: (cap) => editHead(cap, "/terms", (head) => dropTag(head, "og:site_name"), "og:site_name dropped"),
  },
  tagadd: {
    target: CHECK.tagSet,
    // An ELEVENTH og tag. A subset test passes this; set equality does not.
    apply: (cap) =>
      editHead(cap, "/terms", (head) => `${head}<meta property="og:locale" content="en_US"/>`, "og:locale added"),
  },
  tagdupe: {
    target: CHECK.tagSet,
    apply: (cap) =>
      editHead(cap, "/terms", (head) => `${head}<meta property="og:type" content="website"/>`, "og:type duplicated"),
  },
  leak: {
    target: CHECK.tagPlacement,
    apply: (cap) => {
      const route = firstRoute(cap);
      const page = cap.pages[route];
      const before = page.html;
      page.html = before.replace("</head>", `</head><link href="${SITE}/" rel="canonical"/>`);
      if (page.html === before) return undefined;
      return `${route}: a canonical link moved after </head>`;
    },
  },
  imagepath: {
    target: CHECK.ownCard,
    apply: (cap) =>
      editHead(cap, "/terms", (head) => setTag(head, "og:image", `${SITE}/og/privacy.png`), "og:image -> /og/privacy.png"),
  },
  slash: {
    target: CHECK.pageUrl,
    apply: (cap) => editHead(cap, "/", (head) => setTag(head, "og:url", SITE), "root og:url loses its trailing slash"),
  },
  llmsstatus: {
    target: CHECK.registryServed,
    apply: (cap) => {
      cap.llms.status = 500;
      return "/llms.txt -> 500";
    },
  },
  llmsdupe: {
    target: CHECK.registryUnique,
    apply: (cap) => {
      const before = cap.llms.text;
      const lines = before.split("\n");
      const i = lines.findIndex((line) => line.includes("](https://sevenui.dev/docs/components/button):"));
      if (i === -1) return undefined;
      lines.splice(i, 0, lines[i]);
      cap.llms.text = lines.join("\n");
      return "/llms.txt: row for /docs/components/button emitted twice";
    },
  },
  llmsdrop: {
    target: CHECK.coverage,
    apply: (cap) => {
      const before = cap.llms.text;
      cap.llms.text = before
        .split("\n")
        .filter((line) => !line.includes("](https://sevenui.dev/docs/components/button):"))
        .join("\n");
      if (cap.llms.text === before) return undefined;
      return "/llms.txt: row for /docs/components/button removed";
    },
  },
  description: {
    target: CHECK.descriptionDiff,
    apply: (cap) =>
      editHead(
        cap,
        "/docs/components/button",
        (head) => setTag(head, "og:description", "Displays a button built on the Base UI Button primitive"),
        "og:description loses its full stop",
      ),
  },
  registrydesc: {
    target: CHECK.descriptionDiff,
    apply: (cap) => {
      const before = cap.llms.text;
      cap.llms.text = before.replace(
        "](https://sevenui.dev/docs/components/button): Displays a button",
        "](https://sevenui.dev/docs/components/button): Displays a Button",
      );
      if (cap.llms.text === before) return undefined;
      return "/llms.txt row for /docs/components/button: description re-cased";
    },
  },
  title: {
    target: CHECK.titleDiff,
    apply: (cap) => editHead(cap, "/terms", (head) => setTag(head, "og:title", `Terms${SUFFIX}`), "og:title shortened"),
  },
  galleryrule: {
    target: CHECK.titleDiff,
    apply: (cap) =>
      editHead(cap, "/components/button", (head) => setTag(head, "og:title", `Button${SUFFIX}`), "gallery title flattened"),
  },
  rootrule: {
    target: CHECK.titleDiff,
    apply: (cap) => editHead(cap, "/", (head) => setTag(head, "og:title", `SevenUI${SUFFIX}`), "root title suffixed"),
  },
  // --- the inventory --------------------------------------------------------
  inventorytotal: {
    target: CHECK.inventory,
    apply: (cap) => {
      if (!cap.inventoryTotals) return undefined;
      cap.inventoryTotals.total += 1;
      return `inventory total -> ${cap.inventoryTotals.total} while the swept lists did not move`;
    },
  },
  // --- layer 3 --------------------------------------------------------------
  ogmiss: {
    target: CHECK.ogMisses,
    // §16.7's lookup replaced by an open generator: an unknown slug renders.
    apply: (cap) => {
      cap.misses[OG_MISSES[0]].status = 200;
      return `${OG_MISSES[0]} status -> 200`;
    },
  },
  notfoundfull: {
    target: CHECK.notFoundNoExtras,
    apply: (cap) => editMissing(cap, MISSING_PAGES[0], (head) => `${head}<meta property="og:image" content="${SITE}/og/index.png"/>`, "og:image added"),
  },
  notfoundbare: {
    target: CHECK.notFoundComplete,
    apply: (cap) =>
      editMissing(
        cap,
        MISSING_PAGES[0],
        (head) => head.replace(/<meta\b[^>]*\b(?:property|name)="(?:og|twitter):[^"]*"[^>]*>/gu, ""),
        "every og:/twitter: tag stripped",
      ),
  },
  notfoundcard: {
    target: CHECK.notFoundCard,
    apply: (cap) =>
      editMissing(cap, MISSING_PAGES[0], (head) => setTag(head, "twitter:card", "summary_large_image"), "twitter:card -> summary_large_image"),
  },
  notfoundleak: {
    target: CHECK.notFoundPlacement,
    apply: (cap) => {
      const page = cap.missingPages[MISSING_PAGES[0]];
      if (!page) return undefined;
      const before = page.html;
      page.html = before.replace("</head>", `</head><meta property="og:type" content="website"/>`);
      if (page.html === before) return undefined;
      return `${MISSING_PAGES[0]}: an og:type moved after </head>`;
    },
  },
  notfoundtitle: {
    target: CHECK.notFoundOgTitle,
    apply: (cap) =>
      editMissing(cap, MISSING_PAGES[0], (head) => setTag(head, "og:title", "Page not found"), "og:title de-suffixed"),
  },
  notfounddesc: {
    target: CHECK.notFoundOgDescription,
    apply: (cap) =>
      editMissing(cap, MISSING_PAGES[0], (head) => setTag(head, "og:description", "Something else entirely"), "og:description replaced"),
  },
  fieldlives: {
    target: CHECK.notFoundStatus,
    apply: (cap) => {
      const page = cap.missingPages["/components/field"];
      if (!page) return undefined;
      page.status = 200;
      return "/components/field -> 200";
    },
  },
  registryparsed: {
    target: CHECK.registryParsed,
    apply: (cap) => {
      const before = cap.llms.text;
      cap.llms.text = before.replace(/^- \[/gmu, "* [");
      if (cap.llms.text === before) return undefined;
      return "/llms.txt: every row's bullet changed, so nothing parses";
    },
  },
  coveragedouble: {
    target: CHECK.coverageSingleSource,
    apply: (cap) => {
      const before = cap.llms.text;
      cap.llms.text = `${before.trimEnd()}\n- [Terms of Service](${SITE}/terms): A second, competing answer.\n`;
      if (cap.llms.text === before) return undefined;
      return "/llms.txt: /terms given a row, so both sides now answer for it";
    },
  },
  coveragestray: {
    target: CHECK.coverageNoStray,
    apply: (cap) => {
      const before = cap.routes.length;
      cap.routes = cap.routes.filter((route) => route !== "/terms");
      if (cap.routes.length === before) return undefined;
      return "/terms dropped from the swept inventory while the restatement still names it";
    },
  },
  cardunproven: {
    target: CHECK.cardProven,
    apply: (cap) => {
      const card = cap.cards[ogImagePath("/terms")];
      if (!card) return undefined;
      card.status = 503;
      return "/og/terms.png -> 503 while /terms still names it";
    },
  },
  notfoundtwittertitle: {
    target: CHECK.notFoundTwitterTitle,
    apply: (cap) =>
      editMissing(cap, MISSING_PAGES[0], (head) => setTag(head, "twitter:title", "Page not found"), "twitter:title de-suffixed"),
  },
  notfoundtwitterdesc: {
    target: CHECK.notFoundTwitterDescription,
    apply: (cap) =>
      editMissing(cap, MISSING_PAGES[0], (head) => setTag(head, "twitter:description", "Something else entirely"), "twitter:description replaced"),
  },
  witnesstitle: {
    target: CHECK.cardWitnessTitle,
    apply: (cap) => {
      const before = cap.llms.text;
      let n = 0;
      const unique = before.replace(/^(- \[[^\]]+\]\(https:\/\/sevenui\.dev[^)]*\): )(.*)$/gmu, (whole, head, description) => {
        n += 1;
        return `${head}${description} [${n}]`;
      });
      cap.llms.text = `${unique.trimEnd()}\n- [Account](${SITE}/account): An account description of its very own.\n`;
      if (cap.llms.text === before) return undefined;
      return "/llms.txt: every description made unique and /account given its own row — no two routes share a description";
    },
  },
  witnessdesc: {
    target: CHECK.cardWitnessDescription,
    apply: (cap) => {
      const before = cap.llms.text;
      cap.llms.text = before.replace(
        /^- \[([^\]]+)\]\((https:\/\/sevenui\.dev\/components\/[^)]+)\): /gmu,
        (whole, title, url) => `- [${title} Gallery](${url}): `,
      );
      if (cap.llms.text === before) return undefined;
      return "/llms.txt: every /components/<slug> title made unique, dissolving the description witnesses";
    },
  },
};

for (const relation of RELATIONS) {
  const mode = `relation:${relation.breaks.key}=${relation.breaks.value}`;
  PERTURB[mode] = {
    target: relationCheck(relation.name),
    apply: (cap) =>
      editHead(
        cap,
        "/terms",
        (head) => setTag(head, relation.breaks.key, relation.breaks.value),
        `${relation.breaks.key} -> ${JSON.stringify(relation.breaks.value)}`,
      ),
  };
}

const firstRoute = (cap) => [...cap.routes].sort()[0];
const firstCard = (cap) => ogImagePath(firstRoute(cap));

function editMissing(cap, pathname, edit, what) {
  const page = cap.missingPages[pathname];
  if (!page) return undefined;
  const { head, tail } = splitHead(page.html);
  const edited = edit(head);
  if (edited === head) return undefined;
  page.html = edited + tail;
  return `${pathname}: ${what}`;
}

function editHead(cap, route, edit, what) {
  const page = cap.pages[route];
  if (!page) return undefined;
  const { head, tail } = splitHead(page.html);
  const edited = edit(head);
  if (edited === head) return undefined;
  page.html = edited + tail;
  return `${route}: ${what}`;
}

function dropTag(head, key) {
  return head.replace(new RegExp(`<meta\\b[^>]*\\b(?:property|name)="${key}"[^>]*>`, "u"), "");
}

function setTag(head, key, value) {
  return head.replace(
    new RegExp(`<meta\\b[^>]*\\b(?:property|name)="${key}"[^>]*>`, "u"),
    `<meta property="${key}" content="${value}"/>`,
  );
}

// --- CLI --------------------------------------------------------------------

function parseArgs(argv) {
  const args = { verbose: false, controls: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--verbose") args.verbose = true;
    else if (arg === "--controls") args.controls = true;
    else if (arg.startsWith("--")) args[arg.slice(2)] = argv[++i];
  }
  return args;
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function routesFromInventory(json) {
  const inventory = JSON.parse(json);
  const routes = [];
  for (const [key, value] of Object.entries(inventory)) {
    if (key === "notFound" || key === "total") continue;
    if (!Array.isArray(value)) continue;
    routes.push(...value);
  }
  const unique = [...new Set(routes)];
  if (unique.length === 0) throw new Error("inventory produced no routes — refusing to report a clean sweep of nothing");
  return {
    routes: unique.sort(),
    totals: { notFound: (inventory.notFound ?? []).length, total: inventory.total },
  };
}

const args = parseArgs(process.argv.slice(2));
const controlMode = process.env.POSITIVE_CONTROL;
if (controlMode && !PERTURB[controlMode]) {
  console.error(`unknown POSITIVE_CONTROL mode "${controlMode}"; known: ${Object.keys(PERTURB).join(", ")}`);
  process.exit(2);
}

let captured;
if (args.load) {
  captured = JSON.parse(await readFile(args.load, "utf8"));
} else {
  if (!args.base) {
    console.error("usage: og-sweep.mjs --base <url> [--inventory <file>] [--save <file>] [--verbose] [--controls]");
    console.error("   or: og-sweep.mjs --load <file> [--verbose] [--controls]");
    process.exit(2);
  }
  const inventoryJson = args.inventory ? await readFile(args.inventory, "utf8") : await readStdin();
  const { routes, totals } = routesFromInventory(inventoryJson);
  console.log(`sweeping ${routes.length} routes on ${args.base} (${bypass ? "bypass header set" : "NO bypass header"})`);
  captured = await capture(args.base, routes, totals);
  if (args.save) await writeFile(args.save, JSON.stringify(captured));
}
console.log(
  `deployment: x-vercel-id ${captured.deployment?.xVercelId ?? "(none)"} ` +
    `| /llms.txt etag ${captured.deployment?.llmsEtag ?? "(none)"} | base ${captured.base}\n`,
);

const clone = () => JSON.parse(JSON.stringify(captured));

const subject = clone();
if (controlMode) {
  const applied = PERTURB[controlMode].apply(subject);
  if (!applied) {
    console.error(`POSITIVE_CONTROL "${controlMode}" matched nothing — it would have reported a clean run while`);
    console.error("changing nothing, which is the exact failure a control exists to prevent.");
    process.exit(2);
  }
  console.log(`POSITIVE_CONTROL ${controlMode}: ${applied}\n      target: ${PERTURB[controlMode].target}\n`);
}

const { results, notes } = runChecks(subject, { verbose: args.verbose });
for (const result of results) {
  console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.name}${result.detail ? `\n      ${result.detail}` : ""}`);
}
for (const note of notes) console.log(note);
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} assertions passed`);

let controlsFailed = 0;
const baselineOk = new Set(
  runChecks(clone(), { verbose: false })
    .results.filter((r) => r.ok)
    .map((r) => r.name),
);

if (controlMode) {
  // Under a single-mode run the gate is being proved, not run.
  const { target } = PERTURB[controlMode];
  if (!baselineOk.has(target)) {
    console.log(`\nCONTROL INDETERMINATE: target "${target}" was already failing before the corruption`);
    process.exit(1);
  }
  const hit = failed.some((r) => r.name === target);
  console.log(hit ? "\nCONTROL LIVE: its target check went red" : "\nCONTROL DEAD: its target check still passed");
  process.exit(hit ? 0 : 1);
}

if (args.controls) {
  console.log("\n--- positive controls: each corrupts the real capture; its TARGET assertion must go green -> red ---");
  for (const [mode, { target, apply }] of Object.entries(PERTURB)) {
    if (!baselineOk.has(target)) {
      console.log(
        `INDETERMINATE  ${mode}: target "${target}" is already failing on the clean run,\n` +
          "               so its going red under the control proves nothing. Fix the finding, then re-run.",
      );
      controlsFailed += 1;
      continue;
    }
    const corrupted = clone();
    const applied = apply(corrupted);
    if (!applied) {
      console.log(`DEAD  ${mode}: matched nothing in the capture`);
      controlsFailed += 1;
      continue;
    }
    const { results: controlResults } = runChecks(corrupted, { verbose: false });
    const red = controlResults.filter((r) => !r.ok);
    const onTarget = red.find((r) => r.name === target);
    if (!onTarget) {
      console.log(
        `DEAD  ${mode}: ${applied}\n      target "${target}" still passed` +
          (red.length ? `; ${red.length} other check(s) went red, which decides nothing` : "; nothing went red"),
      );
      controlsFailed += 1;
      continue;
    }
    console.log(`LIVE  ${mode}: ${applied}`);
    console.log(`      FAIL  ${onTarget.name}\n            ${onTarget.detail}`);
    const collateral = red.filter((r) => r.name !== target);
    if (collateral.length) console.log(`      (collateral, decides nothing: ${collateral.map((r) => r.name).join(" | ")})`);
  }
  const total = Object.keys(PERTURB).length;
  console.log(`\n${total - controlsFailed}/${total} positive controls went red on their own target`);

  const assertionNames = [...DECLARED_CHECKS.map((key) => CHECK[key]), ...DECLARED_RELATIONS.map(relationCheck)];
  const produced = new Set(results.map((r) => r.name));
  const targeted = new Set(Object.values(PERTURB).map((mode) => mode.target));
  const unguarded = assertionNames.filter((name) => !targeted.has(name));
  const orphanTargets = [...targeted].filter((name) => !produced.has(name));
  const unrecorded = assertionNames.filter((name) => !produced.has(name));
  if (unguarded.length || orphanTargets.length || unrecorded.length) {
    if (unguarded.length) {
      console.log(`\nUNGUARDED ASSERTIONS (no control names them as its target):\n  ${unguarded.join("\n  ")}`);
    }
    if (orphanTargets.length) {
      console.log(`\nORPHAN TARGETS (a control names them, but no assertion is recorded under that name):\n  ${orphanTargets.join("\n  ")}`);
    }
    if (unrecorded.length) {
      console.log(`\nDECLARED BUT NEVER RECORDED:\n  ${unrecorded.join("\n  ")}`);
    }
    controlsFailed += unguarded.length + orphanTargets.length + unrecorded.length;
  } else {
    console.log(
      `every one of the ${assertionNames.length} ASSERTIONS is recorded and is named as some control's target ` +
        `(${DECLARED_CHECKS.length} named + ${DECLARED_RELATIONS.length} generated relations, both declared)`,
    );
  }
}

process.exit(failed.length === 0 && controlsFailed === 0 ? 0 : 1);
