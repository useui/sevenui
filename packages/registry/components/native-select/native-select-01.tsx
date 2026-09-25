"use client";

import { Label } from "@/registry/base/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";

const regions = [
  { value: "eu-central", label: "Frankfurt (eu-central-1)" },
  { value: "eu-west", label: "Dublin (eu-west-1)" },
  { value: "us-east", label: "N. Virginia (us-east-1)" },
  { value: "ap-northeast", label: "Tokyo (ap-northeast-1)" },
];

const pageSizes = ["10", "25", "50", "100"];

export default function NativeSelect01() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Label htmlFor="native-select-01-region">Database region</Label>
        <NativeSelect
          id="native-select-01-region"
          className="w-full"
          defaultValue="eu-central"
          aria-describedby="native-select-01-region-hint"
        >
          {regions.map((region) => (
            <NativeSelectOption key={region.value} value={region.value}>
              {region.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <p
          id="native-select-01-region-hint"
          className="text-sm text-muted-foreground"
        >
          Pick the region closest to most of your users.
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Label
            htmlFor="native-select-01-rows"
            className="text-xs font-normal text-muted-foreground"
          >
            Rows
          </Label>
          <NativeSelect id="native-select-01-rows" size="sm" defaultValue="25">
            {pageSizes.map((pageSize) => (
              <NativeSelectOption key={pageSize} value={pageSize}>
                {pageSize}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <span className="tabular-nums">1–25 of 312</span>
      </div>
    </div>
  );
}
