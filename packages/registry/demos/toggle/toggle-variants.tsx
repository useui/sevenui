import { ItalicIcon } from "lucide-react";

import { Toggle } from "@/registry/base/ui/toggle";

export default function ToggleVariants() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Toggle size="sm" aria-label="Toggle italic (small)">
          <ItalicIcon />
        </Toggle>
        <Toggle aria-label="Toggle italic">
          <ItalicIcon />
        </Toggle>
        <Toggle size="lg" aria-label="Toggle italic (large)">
          <ItalicIcon />
        </Toggle>
      </div>
      <div className="flex items-center gap-2">
        <Toggle variant="outline" size="sm" aria-label="Toggle italic (small)">
          <ItalicIcon />
        </Toggle>
        <Toggle variant="outline" aria-label="Toggle italic">
          <ItalicIcon />
        </Toggle>
        <Toggle variant="outline" size="lg" aria-label="Toggle italic (large)">
          <ItalicIcon />
        </Toggle>
      </div>
    </div>
  );
}
