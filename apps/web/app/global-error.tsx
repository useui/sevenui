"use client";

import "./globals.css";
import { ErrorState } from "../components/error-state";

// Replaces the root layout when the root layout itself throws, so it renders
// its own <html> and <body>.
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body className="bg-background font-sans text-foreground antialiased">
        <main id="content">
          <ErrorState
            error={error}
            message="Something went wrong while loading SevenUI."
            retry={retry}
            title="Something went wrong"
          />
        </main>
      </body>
    </html>
  );
}
