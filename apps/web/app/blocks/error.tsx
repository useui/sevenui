"use client";

import { ErrorState } from "../../components/error-state";

// Renders inside the blocks layout's <main>, for a page that fails after the
// layout itself rendered.
export default function BlocksError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <ErrorState
      error={error}
      message="The blocks directory is temporarily unavailable. Please try again in a moment."
      retry={retry}
      title="Blocks are temporarily unavailable"
    />
  );
}
