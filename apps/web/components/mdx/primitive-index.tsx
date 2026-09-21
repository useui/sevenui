import "server-only";

import Link from "next/link";
import { getDocIndex } from "../../lib/docs";

const PRIMITIVES_PREFIX = "/docs/components/";

export async function PrimitiveIndex() {
  const primitives = (await getDocIndex())
    .filter((page) => page.route.startsWith(PRIMITIVES_PREFIX))
    .sort((a, b) => (a.route < b.route ? -1 : a.route > b.route ? 1 : 0));

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {primitives.map((page) => (
        <Link
          className="rounded-xl border border-border p-5 transition-colors hover:bg-muted/50"
          href={page.route}
          key={page.route}
        >
          <h2 className="font-medium text-sm">{page.title}</h2>
          <p className="mt-1 text-muted-foreground text-sm">{page.description}</p>
        </Link>
      ))}
    </div>
  );
}
