import { act, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// UI SDK runs its accessible-name checks on a timer after a part mounts:
// warnIfUnnamed (select trigger, combobox input, command search field,
// listbox) waits 300ms, checkName (popup and tooltip triggers, meter,
// progress, icon-only items) and checkFocus wait one task. A test that ends
// first unmounts the part and the check finds nothing, so an unnamed fixture
// failed only on a machine slow enough to still be running at 300ms. The
// ui-sdk project's setup installs this: each check is held, and whatever is
// still pending when a test ends runs then, before cleanup unmounts the part,
// so an unnamed control fails on every machine.
//
// Only these checks are forced: they read the markup as it is. UI SDK's
// other delayed check, that a controlled value followed a change it asked
// for (1s), is a statement about time and is left on its timer (porting
// guide §6.3 lists the tests it can still catch on a loaded machine).
const forced = new Set(["warnIfUnnamed", "checkName", "checkFocus"]);
const caller = /^\s*at (\w+) \(.*[\\/]@ui-sdk[\\/]core[\\/]dist[\\/]/;

const pending = new Map<ReturnType<typeof setTimeout>, () => void>();
let installed = false;

export function installDevChecks() {
  if (installed) return;
  installed = true;
  const realSetTimeout = globalThis.setTimeout;
  const realClearTimeout = globalThis.clearTimeout;

  globalThis.setTimeout = function setTimeout(
    handler: TimerHandler,
    delay?: number,
    ...args: unknown[]
  ) {
    const limit = Error.stackTraceLimit;
    Error.stackTraceLimit = 2;
    const stack = new Error().stack ?? "";
    Error.stackTraceLimit = limit;
    // Line 0 is the message, 1 this wrapper, 2 whoever called setTimeout.
    const check = caller.exec(stack.split("\n")[2] ?? "")?.[1];
    if (!check || !forced.has(check) || typeof handler !== "function") {
      return realSetTimeout(handler, delay, ...args);
    }
    const run = () => {
      pending.delete(id);
      handler(...args);
    };
    const id = realSetTimeout(run, delay);
    pending.set(id, run);
    return id;
  } as typeof globalThis.setTimeout;

  globalThis.clearTimeout = function clearTimeout(id) {
    pending.delete(id as ReturnType<typeof setTimeout>);
    realClearTimeout(id);
  } as typeof globalThis.clearTimeout;

  // Registered after setup.ts's cleanup, so it runs first (hooks unwind).
  // A file that turns strict mode off (accessible-names) only gets warnings
  // from these checks, so they stay on their timers there.
  afterEach(async () => {
    if (globalThis.__UI_SDK_STRICT__ !== true) return;
    let failure: unknown;
    try {
      await flushDevChecks();
    } catch (error) {
      failure = error;
    }
    if (failure !== undefined) {
      // A throwing hook stops the hooks after it; unmount so the next test
      // starts from an empty page.
      cleanup();
      throw failure;
    }
  });
}

/**
 * Runs every held UI SDK name check now. Throws the first strict-mode error
 * one raises, after running the rest. A no-op where nothing is installed.
 *
 * It settles first: a part that may be labelled by another part (a select
 * trigger by a SelectLabel) carries a provisional aria-labelledby until UI
 * SDK finds out, a microtask after mount, that no label rendered. Checked
 * synchronously after render, the unnamed trigger would pass.
 */
export async function flushDevChecks() {
  await act(async () => {});
  let first: { error: unknown } | undefined;
  for (const [id, run] of [...pending]) {
    globalThis.clearTimeout(id);
    try {
      run();
    } catch (error) {
      first ??= { error };
    }
  }
  if (first) throw first.error;
}

export function devChecksInstalled() {
  return installed;
}
