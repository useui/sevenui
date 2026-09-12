import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

export default function InputFile() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="input-file">Resume</Label>
      <Input id="input-file" type="file" />
    </div>
  );
}
