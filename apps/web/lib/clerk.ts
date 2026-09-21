import type { Clerk } from "@clerk/clerk-js";

let clerkPromise: Promise<Clerk> | null = null;

function loadClerk(): Promise<Clerk> {
  if (clerkPromise) return clerkPromise;
  const attempt: Promise<Clerk> = (async () => {
    const { Clerk } = await import("@clerk/clerk-js");
    const clerk = new Clerk(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!);
    await clerk.load();
    return clerk;
  })().catch((e) => {
    if (clerkPromise === attempt) clerkPromise = null;
    throw e;
  });
  clerkPromise = attempt;
  return attempt;
}

function hasSessionHint(): boolean {
  return document.cookie.split("; ").some((entry) => {
    const [name, value] = entry.split("=");
    return name === "__client_uat" && !!value && value !== "0";
  });
}

export function getClerkIfLikelySignedIn(): Promise<Clerk> | undefined {
  if (!hasSessionHint()) return undefined;
  return loadClerk();
}

export async function getClerkAlways(): Promise<Clerk> {
  return loadClerk();
}
