import { AspectRatio } from "@/registry/base/ui/aspect-ratio";

export default function AspectRatioDemo() {
  return (
    <AspectRatio ratio={16 / 9}>
      <div className="size-full rounded-md bg-muted" />
    </AspectRatio>
  );
}
