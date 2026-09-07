"use client";

import * as React from "react";

import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/registry/base/ui/progress";

export default function ProgressLabelDemo() {
  const [value, setValue] = React.useState(20);

  React.useEffect(() => {
    const timer = setTimeout(() => setValue(65), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Progress value={value} className="w-72 max-w-full">
      <div className="flex w-full items-center justify-between">
        <ProgressLabel>Uploading assets</ProgressLabel>
        <ProgressValue />
      </div>
    </Progress>
  );
}
