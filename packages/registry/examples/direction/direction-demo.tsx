"use client";

import { SearchIcon } from "lucide-react";

import { DirectionProvider } from "@/registry/base/ui/direction";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/base/ui/input-group";
import { Label } from "@/registry/base/ui/label";

export default function DirectionDemo() {
  return (
    <div className="grid w-full max-w-md gap-6 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label>Left to right</Label>
        <InputGroup>
          <InputGroupInput placeholder="Search..." />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="flex flex-col gap-2" dir="rtl">
        <Label>من اليمين إلى اليسار</Label>
        <DirectionProvider direction="rtl">
          <InputGroup>
            <InputGroupInput placeholder="...ابحث" />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
        </DirectionProvider>
      </div>
    </div>
  );
}
