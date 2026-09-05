"use client";

import * as React from "react";

import { Progress } from "@/registry/base/ui/progress";

export default function ProgressDemo() {
  const [value, setValue] = React.useState(10);

  React.useEffect(() => {
    const timer = setTimeout(() => setValue(80), 600);
    return () => clearTimeout(timer);
  }, []);

  return <Progress value={value} className="w-72 max-w-full" />;
}
