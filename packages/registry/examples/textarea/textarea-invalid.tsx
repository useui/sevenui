import { Label } from "@/registry/base/ui/label";
import { Textarea } from "@/registry/base/ui/textarea";

export default function TextareaInvalid() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="textarea-invalid">Bio</Label>
      <Textarea
        id="textarea-invalid"
        defaultValue="x"
        aria-invalid="true"
        aria-describedby="textarea-invalid-error"
      />
      <p id="textarea-invalid-error" className="text-sm text-destructive">
        Your bio must be at least 20 characters.
      </p>
    </div>
  );
}
