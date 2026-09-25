"use client";

import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";
import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";

const options = [
  { id: "switch-04-minimap", label: "Minimap", keys: ["⌘", "M"], defaultChecked: true },
  { id: "switch-04-wrap", label: "Word wrap", keys: ["⌥", "Z"], defaultChecked: true },
  { id: "switch-04-whitespace", label: "Render whitespace", keys: ["⌘", "."], defaultChecked: false },
  { id: "switch-04-numbers", label: "Line numbers", keys: ["⌘", "L"], defaultChecked: true },
  { id: "switch-04-sticky", label: "Sticky scroll", keys: ["⌘", "J"], defaultChecked: false },
];

export default function Switch04() {
  return (
    <div className="w-full max-w-xs rounded-lg border border-border bg-card p-1 text-card-foreground">
      <p className="px-2 pt-1.5 pb-1 text-xs font-medium text-muted-foreground">View</p>
      <ul className="flex flex-col">
        {options.map((option) => (
          <li key={option.id}>
            <Label
              htmlFor={option.id}
              className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm font-normal hover:bg-accent/60"
            >
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              <KbdGroup className="hidden min-[360px]:inline-flex">
                {option.keys.map((key) => (
                  <Kbd key={key}>{key}</Kbd>
                ))}
              </KbdGroup>
              <Switch id={option.id} size="sm" defaultChecked={option.defaultChecked} />
            </Label>
          </li>
        ))}
      </ul>
    </div>
  );
}
