import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";

export default function SwitchDemo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Switch id="switch-airplane" defaultChecked />
        <Label htmlFor="switch-airplane">Airplane mode</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="switch-small" size="sm" defaultChecked />
        <Label htmlFor="switch-small">Small switch</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="switch-disabled" disabled />
        <Label htmlFor="switch-disabled">Disabled switch</Label>
      </div>
    </div>
  );
}
