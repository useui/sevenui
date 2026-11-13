// Ties the UI SDK notes on the primitive pages (apps/web/lib/ui-sdk-notes.ts) to the divergence table they
// condense, §8 of docs/superpowers/plans/2026-11-13-ui-sdk-porting-guide.md, so the notes cannot rot.
//
// They did: six notes kept describing differences that ports had since removed (the avatar fade, the
// switch's uncheckedValue, tooltip cursor tracking, resizable data attributes, slider thumbs, command
// highlighting), because each fix edited its §8 row and nothing pointed from the row to the note.
//
// Now:
//   - every note names the §8 rows it condenses, and every §8 row is either named by a note or listed in
//     INTERNAL_ROWS with the reason a reader of the docs would not notice it;
//   - a row reference is "<primitive column> | <start of the Base UI column>" and must match exactly one
//     row, so a note citing a row that no longer exists fails;
//   - apps/web/lib/ui-sdk-notes.lock.json records each row's hash as it was when its note (or internal
//     reason) was last reviewed, so editing a row fails until someone rereads what the site says about it
//     and records the review.
//
//   node scripts/check-ui-sdk-notes.mjs                      check
//   node scripts/check-ui-sdk-notes.mjs review "<ref>" ...   record that the notes for these rows were
//                                                            reviewed against the rows as they are now
//   node scripts/check-ui-sdk-notes.mjs rows                 print every row with its reference status

import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { INTERNAL_ROWS, POPUP_NOTE, POPUP_PRIMITIVES, UI_SDK_NOTES } from "../apps/web/lib/ui-sdk-notes.ts";

const ROOT = join(import.meta.dirname, "..");
const GUIDE = "docs/superpowers/plans/2026-11-13-ui-sdk-porting-guide.md";
const LOCK = "apps/web/lib/ui-sdk-notes.lock.json";
const SECTION_START = "## 8. Divergence table";
const SECTION_END = "## 9.";

/** Splits a Markdown table row into cells, keeping pipes inside code spans and escaped pipes. */
function cells(line) {
  const out = [];
  let cell = "";
  let code = false;
  for (let i = 1; i < line.length; i++) {
    const c = line[i];
    if (c === "`") code = !code;
    if (c === "|" && !code && line[i - 1] !== "\\") {
      out.push(cell.trim());
      cell = "";
    } else cell += c;
  }
  return out;
}

export function readRows(text = readFileSync(join(ROOT, GUIDE), "utf8")) {
  const start = text.indexOf(SECTION_START);
  const end = text.indexOf(SECTION_END, start);
  if (start < 0 || end < 0) throw new Error(`${GUIDE}: cannot find "${SECTION_START}" … "${SECTION_END}"`);
  const lines = text.slice(start, end).split("\n").filter((l) => l.startsWith("|"));
  // The header and the |---| separator, asserted rather than assumed, so a changed table cannot silently
  // lose or gain a row.
  if (!/^\| Primitive \|/.test(lines[0] ?? "")) throw new Error(`${GUIDE} §8: the table header changed: ${lines[0]}`);
  if (!/^\|[\s|:-]+$/.test(lines[1] ?? "")) throw new Error(`${GUIDE} §8: no separator row under the header`);
  if (lines.slice(2).some((l) => /^\|[\s|:-]+$/.test(l))) throw new Error(`${GUIDE} §8: holds more than one table`);
  return lines.slice(2).map((line) => {
    const [primitive, base] = cells(line);
    return { primitive, base, key: `${primitive} | ${base}`, hash: `sha256-${createHash("sha256").update(line).digest("hex")}`, line };
  });
}

function resolve(rows, ref) {
  const at = ref.indexOf(" | ");
  if (at < 0) return { error: `"${ref}" is not "<primitive column> | <start of the Base UI column>"` };
  const primitive = ref.slice(0, at);
  const start = ref.slice(at + 3);
  const hits = rows.filter((r) => r.primitive === primitive && r.base.startsWith(start));
  if (hits.length === 1) return { row: hits[0] };
  return { error: hits.length === 0 ? `"${ref}" matches no §8 row` : `"${ref}" matches ${hits.length} §8 rows; quote more of the Base UI column` };
}

function references() {
  const refs = [];
  for (const [primitive, notes] of Object.entries(UI_SDK_NOTES)) {
    for (const note of notes ?? []) refs.push({ where: `UI_SDK_NOTES.${primitive}: "${note.text.slice(0, 50)}…"`, note, rows: note.rows });
  }
  refs.push({ where: `POPUP_NOTE`, note: POPUP_NOTE, rows: POPUP_NOTE.rows });
  for (const [ref, reason] of Object.entries(INTERNAL_ROWS)) refs.push({ where: `INTERNAL_ROWS["${ref}"]`, internal: reason, rows: [ref] });
  return refs;
}

function check() {
  const errors = [];
  const rows = readRows();
  if (rows.length === 0) errors.push(`${GUIDE} §8 has no rows`);
  const keys = new Map();
  for (const row of rows) {
    if (!row.primitive || !row.base) errors.push(`§8 row without a primitive or Base UI column: ${row.line}`);
    if (keys.has(row.key)) errors.push(`§8 has two rows "${row.key}"; make the Base UI column tell them apart`);
    keys.set(row.key, row);
  }
  const primitives = new Set(
    JSON.parse(readFileSync(join(ROOT, "packages/registry/registry.json"), "utf8"))
      .items.filter((i) => i.type === "registry:ui")
      .map((i) => i.name),
  );
  for (const name of [...Object.keys(UI_SDK_NOTES), ...POPUP_PRIMITIVES]) {
    if (!primitives.has(name)) errors.push(`ui-sdk-notes: "${name}" is not a primitive`);
  }

  // Coverage: each row is surfaced by a note or internal, never both, never neither.
  const surfaced = new Map();
  const internal = new Map();
  for (const ref of references()) {
    if (ref.note && (!ref.note.text?.trim() || ref.rows.length === 0)) errors.push(`${ref.where}: a note needs text and at least one §8 row`);
    if (ref.internal !== undefined && !ref.internal.trim()) errors.push(`${ref.where}: give the reason a reader would not notice this row`);
    for (const r of ref.rows) {
      const { row, error } = resolve(rows, r);
      if (error) {
        errors.push(`${ref.where}: ${error}`);
        continue;
      }
      (ref.note ? surfaced : internal).set(row.key, [...((ref.note ? surfaced : internal).get(row.key) ?? []), ref.where]);
    }
  }
  for (const row of rows) {
    if (surfaced.has(row.key) && internal.has(row.key)) errors.push(`§8 row "${row.key}" is both surfaced (${surfaced.get(row.key).join("; ")}) and internal`);
    if (!surfaced.has(row.key) && !internal.has(row.key)) {
      errors.push(`§8 row "${row.key}" is neither surfaced by a note in apps/web/lib/ui-sdk-notes.ts nor listed in INTERNAL_ROWS`);
    }
  }

  // Review lock: a row edited since its note was reviewed fails.
  const lock = existsSync(join(ROOT, LOCK)) ? JSON.parse(readFileSync(join(ROOT, LOCK), "utf8")).rows ?? {} : null;
  if (lock === null) errors.push(`${LOCK} is missing`);
  else {
    for (const row of rows) {
      const where = surfaced.get(row.key)?.join("; ") ?? internal.get(row.key)?.join("; ") ?? "nothing";
      if (lock[row.key] === undefined) {
        errors.push(`§8 row "${row.key}" was never reviewed against the notes (read by ${where}); once the note is right, run node scripts/check-ui-sdk-notes.mjs review "${row.key}"`);
      } else if (lock[row.key] !== row.hash) {
        errors.push(
          `§8 row "${row.key}" changed since the notes were reviewed against it. Reread ${where} against the row, fix the note (or move the row between a note and INTERNAL_ROWS), then run node scripts/check-ui-sdk-notes.mjs review "${row.key}"`,
        );
      }
    }
    for (const key of Object.keys(lock)) if (!keys.has(key)) errors.push(`${LOCK} lists "${key}", which is no longer a §8 row; remove it with review`);
  }

  if (errors.length) {
    console.error(`check-ui-sdk-notes: ${errors.length} problem(s)\n${errors.map((e) => `  - ${e}`).join("\n")}`);
    process.exit(1);
  }
  const notes = Object.values(UI_SDK_NOTES).reduce((n, list) => n + (list?.length ?? 0), 1);
  console.log(
    `check-ui-sdk-notes: ok (${rows.length} §8 rows: ${surfaced.size} surfaced by ${notes} notes, ${internal.size} internal; all reviewed at their current text)`,
  );
}

function review(refs) {
  if (refs.length === 0) {
    console.error('review: name each reviewed row, e.g. node scripts/check-ui-sdk-notes.mjs review "avatar | the image mounts"');
    process.exit(1);
  }
  const rows = readRows();
  const keys = new Set(rows.map((r) => r.key));
  const file = join(ROOT, LOCK);
  const lock = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")).rows ?? {} : {};
  for (const ref of refs) {
    const { row, error } = resolve(rows, ref);
    if (row) {
      lock[row.key] = row.hash;
      console.log(`review: "${row.key}"`);
    } else if (lock[ref] !== undefined && !keys.has(ref)) {
      delete lock[ref];
      console.log(`review: dropped "${ref}", which is no longer a §8 row`);
    } else {
      console.error(`review: ${error}`);
      process.exit(1);
    }
  }
  const sorted = Object.fromEntries(Object.entries(lock).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(
    file,
    `${JSON.stringify(
      {
        description:
          "Each §8 row of the porting guide as it was when the UI SDK notes (apps/web/lib/ui-sdk-notes.ts) were last reviewed against it. Written by node scripts/check-ui-sdk-notes.mjs review; never edit by hand.",
        rows: sorted,
      },
      null,
      2,
    )}\n`,
  );
}

function listRows() {
  const rows = readRows();
  const covered = new Map();
  for (const ref of references()) for (const r of ref.rows) {
    const { row } = resolve(rows, r);
    if (row) covered.set(row.key, ref.note ? "note" : "internal");
  }
  for (const row of rows) console.log(`${(covered.get(row.key) ?? "-").padEnd(8)} ${row.key.slice(0, 150)}`);
}

const [command, ...args] = process.argv.slice(2);
if (command === "review") review(args);
else if (command === "rows") listRows();
else if (command === undefined) check();
else {
  console.error(`unknown command "${command}" (review, rows)`);
  process.exit(1);
}
