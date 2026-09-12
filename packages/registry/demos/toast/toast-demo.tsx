"use client";

import { Button } from "@/registry/base/ui/button";
import { Toaster, toast } from "@/registry/base/ui/toast";

export default function ToastDemo() {
  return (
    <div>
      <Toaster />
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() =>
            toast.add({
              title: "Event created",
              description: "Sunday, September 7 at 9:00",
            })
          }
        >
          Show toast
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.add({ title: "Changes saved", type: "success" })}
        >
          Success
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.add({ title: "Something went wrong", type: "error" })
          }
        >
          Error
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
              loading: { title: "Saving…" },
              success: { title: "Saved" },
              error: { title: "Failed to save" },
            })
          }
        >
          Promise
        </Button>
      </div>
    </div>
  );
}
