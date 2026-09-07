import { Checkbox } from "@/registry/base/ui/checkbox";
import { Label } from "@/registry/base/ui/label";

export default function CheckboxDemo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Checkbox id="checkbox-terms" defaultChecked />
        <Label htmlFor="checkbox-terms">Accept terms</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="checkbox-disabled" disabled />
        <Label htmlFor="checkbox-disabled">Disabled checkbox</Label>
      </div>
    </div>
  );
}
