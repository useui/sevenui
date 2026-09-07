"use client";

import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";

export default function CardImage() {
  return (
    <Card className="w-full max-w-sm">
      <img src="/placeholder.svg" alt="" className="aspect-video object-cover" />
      <CardHeader>
        <CardTitle>Designing with constraints</CardTitle>
        <CardDescription>
          Why limitations make interfaces better, not worse.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        Grids, type scales, and spacing tokens do the heavy lifting so every
        screen feels like part of the same product.
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm">
          Read article
        </Button>
      </CardFooter>
    </Card>
  );
}
