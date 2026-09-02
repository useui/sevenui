import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

export default function LabelDemo() {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="name@example.com" />
    </div>
  );
}
