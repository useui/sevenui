"use client";

import { Label } from "@/registry/base/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";

export default function NativeSelectDemo() {
  return (
    <div className="flex items-end gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="native-select-timezone">Timezone</Label>
        <NativeSelect id="native-select-timezone" defaultValue="">
          <NativeSelectOption value="" disabled>
            Select a timezone
          </NativeSelectOption>
          <NativeSelectOption value="utc">UTC</NativeSelectOption>
          <NativeSelectOption value="europe-istanbul">
            Europe/Istanbul
          </NativeSelectOption>
          <NativeSelectOption value="america-new-york">
            America/New_York
          </NativeSelectOption>
          <NativeSelectOption value="asia-tokyo">Asia/Tokyo</NativeSelectOption>
        </NativeSelect>
      </div>
      <NativeSelect size="sm" defaultValue="10" aria-label="Rows per page">
        <NativeSelectOption value="10">10 rows</NativeSelectOption>
        <NativeSelectOption value="25">25 rows</NativeSelectOption>
        <NativeSelectOption value="50">50 rows</NativeSelectOption>
      </NativeSelect>
    </div>
  );
}
