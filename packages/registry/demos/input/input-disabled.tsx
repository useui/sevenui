import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

export default function InputDisabled() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="input-disabled">Username</Label>
      <Input id="input-disabled" defaultValue="emma" disabled />
    </div>
  );
}
