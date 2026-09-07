import { Checkbox } from "@/registry/base/ui/checkbox";
import { Label } from "@/registry/base/ui/label";

export default function CheckboxDisabled() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Checkbox id="checkbox-disabled-unchecked" disabled />
        <Label htmlFor="checkbox-disabled-unchecked">Disabled unchecked</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="checkbox-disabled-checked" disabled defaultChecked />
        <Label htmlFor="checkbox-disabled-checked">Disabled checked</Label>
      </div>
    </div>
  );
}
