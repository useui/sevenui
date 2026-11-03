"use client";

import { Skeleton } from "@/registry/base/ui/skeleton";
import { LabSection } from "../lab-frame";

export default function SkeletonMatrix() {
  return (
    <div>
      <LabSection title="profile row (pulse; none under reduced motion)">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="grid gap-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </LabSection>
      <LabSection title="card">
        <div className="grid w-64 gap-3">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </LabSection>
    </div>
  );
}
