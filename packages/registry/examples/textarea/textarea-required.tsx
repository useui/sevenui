import { Label } from "@/registry/base/ui/label";
import { Textarea } from "@/registry/base/ui/textarea";

export default function TextareaRequired() {
  return (
    <form className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="textarea-required">
        Feedback <span className="text-destructive">*</span>
      </Label>
      <Textarea
        id="textarea-required"
        placeholder="Tell us what went wrong..."
        required
      />
    </form>
  );
}
