"use client";

import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

export default function Input04() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="input-04-url">Website</Label>
        <div className="flex">
          <span className="flex items-center rounded-l-lg border border-r-0 border-input bg-muted px-2.5 text-sm text-muted-foreground">
            https://
          </span>
          <Input id="input-04-url" defaultValue="sevenui.dev" className="rounded-l-none" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="input-04-price">Price</Label>
        <div className="flex">
          <Input
            id="input-04-price"
            type="text"
            inputMode="decimal"
            defaultValue="49.00"
            className="rounded-r-none"
          />
          <span className="flex items-center rounded-r-lg border border-l-0 border-input bg-muted px-2.5 text-sm text-muted-foreground">
            USD
          </span>
        </div>
      </div>
    </div>
  );
}
