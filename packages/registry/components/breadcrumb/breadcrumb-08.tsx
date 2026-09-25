"use client";

import { ChevronRight, CornerLeftUp, Folder, FolderOpen } from "lucide-react";
import { Fragment, useState } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/base/ui/breadcrumb";
import { Button } from "@/registry/base/ui/button";

type Node = {
  id: string;
  name: string;
  children?: Node[];
};

const workspace: Node = {
  id: "workspace",
  name: "Workspace",
  children: [
    {
      id: "product",
      name: "Product",
      children: [
        {
          id: "roadmap",
          name: "Roadmap",
          children: [
            { id: "q4-planning", name: "Q4 planning" },
            { id: "mobile-offline", name: "Mobile offline mode" },
          ],
        },
        { id: "release-notes", name: "Release notes" },
      ],
    },
    {
      id: "research",
      name: "Research",
      children: [
        { id: "interviews", name: "Customer interviews" },
        { id: "surveys", name: "Pricing survey" },
      ],
    },
    { id: "operations", name: "Operations" },
  ],
};

const crumbClassName =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function Breadcrumb08() {
  const [path, setPath] = useState<Node[]>([workspace]);
  const current = path[path.length - 1];
  const parent = path.length > 1 ? path[path.length - 2] : null;
  const children = current.children ?? [];

  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-xs">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={parent ? `Up to ${parent.name}` : "Already at top level"}
          disabled={!parent}
          onClick={() => setPath((prev) => prev.slice(0, -1))}
        >
          <CornerLeftUp aria-hidden="true" />
        </Button>
        <Breadcrumb aria-label="Folder path" className="min-w-0 flex-1">
          <BreadcrumbList>
            {path.map((node, index) => {
              const isLast = index === path.length - 1;
              return (
                <Fragment key={node.id}>
                  {index > 0 ? <BreadcrumbSeparator /> : null}
                  <BreadcrumbItem className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-left-2 motion-safe:duration-200 motion-safe:ease-out">
                    {isLast ? (
                      <BreadcrumbPage className="font-medium">
                        {node.name}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        render={<button type="button" />}
                        className={crumbClassName}
                        onClick={() =>
                          setPath((prev) => prev.slice(0, index + 1))
                        }
                      >
                        {node.name}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <p aria-live="polite" className="sr-only">
        {`Opened ${current.name}, ${children.length} ${children.length === 1 ? "folder" : "folders"}`}
      </p>

      {children.length > 0 ? (
        <ul className="flex flex-col p-1.5">
          {children.map((child) => (
            <li key={child.id}>
              <button
                type="button"
                onClick={() => setPath((prev) => [...prev, child])}
                className="group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Folder
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground"
                />
                <span className="min-w-0 flex-1 truncate">{child.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {child.children?.length ?? 0}
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="cn-rtl-flip size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
          <FolderOpen
            aria-hidden="true"
            className="size-5 text-muted-foreground"
          />
          <p className="text-sm font-medium">
            {current.name} has no subfolders
          </p>
          <p className="text-xs text-muted-foreground">
            Use the path above to jump back to any parent folder.
          </p>
        </div>
      )}
    </div>
  );
}
