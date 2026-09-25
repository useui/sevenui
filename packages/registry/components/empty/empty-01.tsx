"use client";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/registry/base/ui/empty";

export default function Empty01() {
  return (
    <Empty className="w-full max-w-sm p-4">
      <EmptyHeader>
        <EmptyTitle>No saved replies</EmptyTitle>
        <EmptyDescription>
          Canned responses you save from the composer show up here.{" "}
          <a href="#saved-replies">Learn how to save one</a>
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
