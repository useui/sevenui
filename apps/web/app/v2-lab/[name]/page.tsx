import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { LabFrame } from "../../../components/v2-lab/lab-frame";

export const metadata: Metadata = { title: "v2 lab", robots: { index: false } };

export default async function V2LabPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (process.env.NODE_ENV === "production") notFound();
  if (!/^[a-z0-9-]+$/u.test(name)) notFound();
  if (!existsSync(join(process.cwd(), "components/v2-lab/matrices", `${name}.tsx`))) notFound();
  const Matrix = dynamic(() => import(`../../../components/v2-lab/matrices/${name}`));
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 font-mono text-lg">v2 lab / {name}</h1>
      <LabFrame>
        <Matrix />
      </LabFrame>
    </main>
  );
}
