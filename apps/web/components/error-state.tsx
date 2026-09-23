"use client";

import { useEffect } from "react";

export function ErrorState({
  error,
  retry,
  title,
  message,
}: {
  error: Error & { digest?: string };
  retry: () => void;
  title: string;
  message: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-6 py-24 text-center"
      role="alert"
    >
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <p className="text-muted-foreground">{message}</p>
      <button
        className="mt-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
        onClick={retry}
        type="button"
      >
        Try again
      </button>
    </div>
  );
}
