"use client";

import { usePathname } from "next/navigation";
import { ErrorState } from "../components/error-state";

// Sits above every section layout, so it also catches a section layout that
// throws, like /blocks when the pro manifest cannot be fetched.
export default function RootError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const pathname = usePathname();
  const inBlocks = pathname === "/blocks" || pathname.startsWith("/blocks/");

  return (
    <main id="content">
      <ErrorState
        error={error}
        message={
          inBlocks
            ? "The blocks directory is temporarily unavailable. Please try again in a moment."
            : "Something went wrong while loading this page."
        }
        retry={retry}
        title={inBlocks ? "Blocks are temporarily unavailable" : "Something went wrong"}
      />
    </main>
  );
}
