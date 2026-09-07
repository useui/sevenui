"use client";

import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";

type TreeNode = { name: string; children?: TreeNode[] };

const tree: TreeNode[] = [
  {
    name: "src",
    children: [
      {
        name: "components",
        children: [{ name: "button.tsx" }, { name: "card.tsx" }],
      },
      { name: "lib", children: [{ name: "utils.ts" }] },
      { name: "index.ts" },
    ],
  },
  { name: "package.json" },
  { name: "README.md" },
];

function TreeItem({ node }: { node: TreeNode }) {
  if (!node.children) {
    return (
      <div className="flex items-center gap-2 rounded-md px-2 py-1 text-sm">
        <FileIcon className="size-4 text-muted-foreground" />
        {node.name}
      </div>
    );
  }

  return (
    <Collapsible defaultOpen={node.name === "src"}>
      <CollapsibleTrigger className="group/tree flex w-full items-center gap-2 rounded-md px-2 py-1 text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
        <ChevronRightIcon className="size-4 text-muted-foreground transition-transform group-data-panel-open/tree:rotate-90" />
        <FolderIcon className="size-4 text-muted-foreground" />
        {node.name}
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-5">
        {node.children.map((child) => (
          <TreeItem key={child.name} node={child} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function CollapsibleFileTree() {
  return (
    <div className="w-full max-w-xs rounded-lg border p-2">
      {tree.map((node) => (
        <TreeItem key={node.name} node={node} />
      ))}
    </div>
  );
}
