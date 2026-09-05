import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

export default function ToggleGroupDemo() {
  return (
    <ToggleGroup defaultValue={["center"]}>
      <ToggleGroupItem value="left" aria-label="Align left">
        <AlignLeftIcon className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <AlignCenterIcon className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <AlignRightIcon className="size-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
