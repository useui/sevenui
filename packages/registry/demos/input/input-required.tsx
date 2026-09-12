import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

export default function InputRequired() {
  return (
    <form className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="input-required">
        Email <span className="text-destructive">*</span>
      </Label>
      <Input
        id="input-required"
        type="email"
        placeholder="name@example.com"
        required
      />
    </form>
  );
}
