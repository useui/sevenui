import { Label } from "@/registry/base/ui/label";
import { Textarea } from "@/registry/base/ui/textarea";

export default function TextareaDisabled() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="textarea-disabled">Release notes</Label>
      <Textarea
        id="textarea-disabled"
        defaultValue="Locked while the release is being published."
        disabled
      />
    </div>
  );
}
