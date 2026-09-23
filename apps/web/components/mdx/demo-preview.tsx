"use client";

import { demoMap } from "./demo-map.generated";

export function DemoPreview({ path }: { path: string }) {
  const Demo = demoMap[path];
  if (!Demo) {
    throw new Error(`<Component path="${path}">: no such demo in packages/registry/demos/registry.json`);
  }
  return <Demo />;
}
