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

// The site header and footer carry their own links (the footer already lists /docs/components/switch),
// so link checks read only the page's own <main>.
function mainHtml(html) {
  const start = html.indexOf("<main");
  const end = html.indexOf("</main>", start);
  return start === -1 || end === -1 ? "" : html.slice(start, end);
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
      // Without <script>: the RSC payload repeats the copy, and copy that exists only there is not rendered.
      const flat = text(html.replace(/<script\b[\s\S]*?<\/script>/g, ""));
      const missing = STEP_COPY.filter((phrase) => !flat.includes(phrase));
      return missing.length ? `missing: ${missing.join(" | ")}` : null;
    },
    breakIt: (html) => html.replaceAll("Base UI keeps the behavior", "Base UI"),
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
    name: "the internal links are real anchors inside <main>",
    run: (html) => {
      const main = mainHtml(html);
      const missing = LINKS.filter((href) => !main.includes(`href="${href}"`));
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
