import type { Metadata } from "next";
import Link from "next/link";
import { notFoundMetadata } from "../lib/metadata";

export const metadata: Metadata = notFoundMetadata();

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <p className="text-6xl font-bold text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="text-muted-foreground">We couldn&apos;t find the page you&apos;re looking for.</p>
      <Link className="mt-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground" href="/">
        Back to home
      </Link>
    </div>
  );
}
