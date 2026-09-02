import { AspectRatio } from "@/registry/base/ui/aspect-ratio";

export default function AspectRatioDemo() {
  return (
    <div className="w-full max-w-md">
      <AspectRatio
        ratio={16 / 9}
        className="overflow-hidden rounded-md border bg-muted"
      >
        <img
          src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
          alt="Photo by Drew Beamer"
          className="size-full object-cover"
        />
      </AspectRatio>
    </div>
  );
}
