import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

export default function InputInvalid() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="input-invalid">Workspace URL</Label>
      <Input
        id="input-invalid"
        defaultValue="seven ui"
        aria-invalid="true"
        aria-describedby="input-invalid-error"
      />
      <p id="input-invalid-error" className="text-sm text-destructive">
        The URL can&apos;t contain spaces.
      </p>
    </div>
  );
}
