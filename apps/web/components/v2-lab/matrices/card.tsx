"use client";

import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { LabSection } from "../lab-frame";

const SIZES = ["default", "sm"] as const;

export default function CardMatrix() {
  return (
    <div>
      {SIZES.map((size) => (
        <LabSection key={size} title={`size=${size}`}>
          <Card size={size} className="w-72">
            <CardHeader>
              <CardTitle>Usage this month</CardTitle>
              <CardDescription>Requests across every project.</CardDescription>
              <CardAction>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-medium tabular-nums">48,210</p>
            </CardContent>
            <CardFooter>
              <Button size="sm">View report</Button>
            </CardFooter>
          </Card>
          <Card size={size} className="w-56">
            <CardHeader className="border-b">
              <CardTitle>Header with border</CardTitle>
            </CardHeader>
            <CardContent>Content only, no footer.</CardContent>
          </Card>
          <Card size={size} className="w-56">
            {/* biome-ignore lint/performance/noImgElement: dev-only lab renders the static /placeholder.svg, no loader needed */}
            <img src="/placeholder.svg" alt="" className="aspect-video w-full object-cover" />
            <CardHeader>
              <CardTitle>Image first</CardTitle>
              <CardDescription>The image takes the top radius.</CardDescription>
            </CardHeader>
          </Card>
        </LabSection>
      ))}
    </div>
  );
}
