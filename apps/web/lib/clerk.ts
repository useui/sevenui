import type { Clerk } from "@clerk/clerk-js";

let clerkPromise: Promise<Clerk> | null = null;

export function getClerk(): Promise<Clerk> {
  clerkPromise ??= (async () => {
    // Dynamic import so the ~1.5MB Clerk bundle code-splits into its own
    // chunk instead of loading on every page that pulls in this module
    // (the Header, /account, /pro) — callers decide WHEN to call this,
    // this module just keeps the network fetch out of the initial chunk.
    const { Clerk } = await import("@clerk/clerk-js");
    const clerk = new Clerk(import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY);
    await clerk.load();
    return clerk;
  })();
  return clerkPromise;
}
