import { Checkbox } from "@/registry/base/ui/checkbox";
import { Label } from "@/registry/base/ui/label";

export default function CheckboxDemo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <Label>
          <Checkbox defaultChecked />
          Accept terms
        </Label>
      </div>
      <div className="flex items-center">
        <Label>
          <Checkbox disabled />
          Disabled checkbox
        </Label>
      </div>
    </div>
  );
}
