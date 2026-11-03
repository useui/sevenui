"use client";

import * as React from "react";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  useToastManager,
} from "@/registry/base/ui/toast";
import { Button } from "@/registry/base/ui/button";
import { LabSection } from "../lab-frame";

function LabToasts() {
  const { toasts } = useToastManager();
  return toasts.map((item) => (
    <Toast key={item.id} toast={item}>
      <ToastContent>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastTitle />
          <ToastDescription />
        </div>
        <ToastAction />
        <ToastClose />
      </ToastContent>
    </Toast>
  ));
}

function Seed({ manager }: { manager: ReturnType<typeof createToastManager> }) {
  const seeded = React.useRef(false);
  React.useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    manager.add({ title: "Invitation sent", timeout: 0 });
    manager.add({
      title: "Workspace saved",
      description: "Agents will pick up the change on the next run.",
      timeout: 0,
      actionProps: { children: "Undo" },
    });
  }, [manager]);
  return null;
}

function Stack() {
  const [manager] = React.useState(() => createToastManager());
  return (
    <ToastProvider toastManager={manager}>
      <Seed manager={manager} />
      <div className="flex w-full max-w-sm flex-col gap-3">
        <ToastViewport className="relative inset-auto mx-0 h-44 w-full max-w-sm">
          <LabToasts />
        </ToastViewport>
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() =>
            manager.add({
              title: "Report exported",
              description: "Find it in your downloads.",
              timeout: 0,
              actionProps: { children: "Open" },
            })
          }
        >
          Add toast
        </Button>
      </div>
    </ToastProvider>
  );
}

export default function ToastMatrix() {
  return (
    <div>
      <LabSection title="stack (hover or focus to expand; tab to the toast, action and close)">
        <Stack />
      </LabSection>
      <p className="text-muted-foreground font-mono text-xs">
        Status icons (success / info / warning / error / loading) render through
        &lt;Toaster /&gt;, whose portal escapes the cell; they are asserted in
        tests/toast.test.tsx.
      </p>
    </div>
  );
}
