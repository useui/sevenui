import { Clerk } from "@clerk/clerk-js";

let clerkPromise: Promise<Clerk> | null = null;

export function getClerk(): Promise<Clerk> {
  clerkPromise ??= (async () => {
    const clerk = new Clerk(import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY);
    await clerk.load();
    return clerk;
  })();
  return clerkPromise;
}
