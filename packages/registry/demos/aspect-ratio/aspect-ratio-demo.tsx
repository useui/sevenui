import { AspectRatio } from "@/registry/base/ui/aspect-ratio";

export default function AspectRatioDemo() {
  return (
    <div className="w-full max-w-96">
      <AspectRatio
        ratio={16 / 9}
        className="flex items-center justify-center rounded-md bg-muted"
      >
        <span className="text-sm text-muted-foreground">16 : 9</span>
      </AspectRatio>
    </div>
  );
}
