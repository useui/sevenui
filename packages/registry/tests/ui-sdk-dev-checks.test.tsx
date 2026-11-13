import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";
import { isUiSdk } from "./helpers/flavour";
import { devChecksInstalled, flushDevChecks } from "./helpers/ui-sdk-dev-checks";

const fruits = [{ label: "Apple", value: "apple" }];

// The positive control for tests/helpers/ui-sdk-dev-checks.ts: if a UI SDK
// update renamed or moved its name checks, the setup would stop holding them
// and unnamed fixtures would go back to failing only on a slow machine.
describe("UI SDK delayed name checks", () => {
  it("are held until the test ends, so an unnamed select trigger fails at once", async () => {
    // Deliberately unnamed: this case checks that the check fires.
    render(
      <Select items={fruits}>
        <SelectTrigger>
          <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>,
    );
    if (isUiSdk) {
      expect(devChecksInstalled()).toBe(true);
      // Well inside UI SDK's 300ms delay: the check ran because it was held.
      await expect(flushDevChecks()).rejects.toThrow(/The trigger has no accessible name/);
    } else {
      // Base UI has no delayed name check, and the base setup holds nothing.
      expect(devChecksInstalled()).toBe(false);
      await expect(flushDevChecks()).resolves.toBeUndefined();
    }
  });

  it("pass a named select trigger", async () => {
    render(
      <Select items={fruits}>
        <SelectTrigger aria-label="Fruit">
          <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>,
    );
    await expect(flushDevChecks()).resolves.toBeUndefined();
  });
});
