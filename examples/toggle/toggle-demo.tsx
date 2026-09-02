import { Toggle } from "@/registry/base/ui/toggle";

export default function ToggleDemo() {
  return (
    <Toggle variant="outline" aria-label="Toggle bold">
      <span className="font-bold">B</span>
    </Toggle>
  );
}
