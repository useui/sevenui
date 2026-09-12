import { ScrollArea } from "@/registry/base/ui/scroll-area";

const artworks = [
  "Sunrise over the bay",
  "Concrete and glass",
  "Field studies",
  "Night traffic",
  "Quiet interiors",
  "Coastal walk",
];

export default function ScrollAreaHorizontal() {
  return (
    <ScrollArea
      orientation="horizontal"
      className="w-full max-w-sm rounded-lg border"
    >
      <div className="flex w-max gap-3 p-3">
        {artworks.map((title) => (
          <figure key={title} className="w-36 shrink-0">
            <img
              src="/placeholder.svg"
              alt=""
              className="aspect-square rounded-md object-cover"
            />
            <figcaption className="mt-1.5 truncate text-xs text-muted-foreground">
              {title}
            </figcaption>
          </figure>
        ))}
      </div>
    </ScrollArea>
  );
}
