"use client";

import { Badge } from "@/registry/base/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Progress, ProgressLabel, ProgressValue } from "@/registry/base/ui/progress";

export default function Card04() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Design system refresh</CardTitle>
        <CardDescription>
          Unify tokens and components across the product.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={68} className="w-full">
          <div className="flex w-full items-center justify-between">
            <ProgressLabel>Tasks completed</ProgressLabel>
            <ProgressValue />
          </div>
        </Progress>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <Badge variant="secondary">In progress</Badge>
        <span className="text-xs text-muted-foreground">Due Sep 30</span>
      </CardFooter>
    </Card>
  );
}
