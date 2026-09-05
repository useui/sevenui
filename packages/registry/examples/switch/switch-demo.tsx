import { Switch } from "@/registry/base/ui/switch";
import { Label } from "@/registry/base/ui/label";

export default function SwitchDemo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <Label>
          <Switch defaultChecked />
          Airplane mode
        </Label>
      </div>
      <div className="flex items-center">
        <Label>
          <Switch disabled />
          Disabled switch
        </Label>
      </div>
    </div>
  );
}
