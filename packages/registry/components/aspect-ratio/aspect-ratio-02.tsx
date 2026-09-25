"use client";

import { Clock } from "lucide-react";

import { AspectRatio } from "@/registry/base/ui/aspect-ratio";
import { Badge } from "@/registry/base/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";

const related = [
  { title: "Choosing a type scale for dense dashboards", minutes: 6 },
  { title: "Motion that respects reduced-motion settings", minutes: 4 },
];

export default function AspectRatio02() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Card className="pt-0">
        <AspectRatio ratio={16 / 9} className="bg-muted">
          <img
            src="/placeholder.svg"
            alt="Side-by-side light and dark versions of a settings screen"
            className="absolute inset-0 size-full object-cover"
          />
        </AspectRatio>
        <CardHeader>
          <Badge variant="secondary" className="mb-1">
            Design systems
          </Badge>
          <CardTitle>Designing dark mode without inverting everything</CardTitle>
          <CardDescription>
            Why elevation, not brightness, should drive your dark palette.
          </CardDescription>
        </CardHeader>
      </Card>
      <ul className="flex flex-col gap-3">
        {related.map((item) => (
          <li key={item.title}>
            <Card size="sm" className="flex-row items-center gap-3 px-3">
              <AspectRatio
                ratio={1}
                className="w-16 shrink-0 overflow-hidden rounded-md bg-muted"
              >
                <img
                  src="/placeholder.svg"
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                />
              </AspectRatio>
              <CardContent className="flex min-w-0 flex-col gap-1 px-0">
                <span className="text-sm leading-snug font-medium">
                  {item.title}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock aria-hidden="true" className="size-3" />
                  {item.minutes} min read
                </span>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
