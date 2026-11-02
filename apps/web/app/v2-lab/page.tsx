import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const metadata: Metadata = { title: "v2 lab", robots: { index: false } };

function primitiveNames(): string[] {
  const path = join(process.cwd(), "../../packages/registry/registry.json");
  const registry = JSON.parse(readFileSync(path, "utf8")) as {
    items: { name: string; type: string }[];
  };
  return registry.items.filter((item) => item.type === "registry:ui").map((item) => item.name);
}

export default function V2LabIndex() {
  if (process.env.NODE_ENV === "production") notFound();
  const matrices = join(process.cwd(), "components/v2-lab/matrices");
  const names = primitiveNames();
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">v2 lab</h1>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {names.map((name) =>
          existsSync(join(matrices, `${name}.tsx`)) ? (
            <li key={name}>
              <Link className="underline" href={`/v2-lab/${name}`}>
                {name}
              </Link>
            </li>
          ) : (
            <li key={name} className="text-muted-foreground">
              {name} (no matrix)
            </li>
          ),
        )}
      </ul>
    </main>
  );
}
