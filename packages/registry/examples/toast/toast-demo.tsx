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
            toast("Event created", {
              description: "Sunday, September 7 at 9:00",
            })
          }
        >
          Show toast
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.success("Changes saved")}
        >
          Success
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.error("Something went wrong")}
        >
          Error
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.promise(
              new Promise((resolve) => setTimeout(resolve, 2000)),
              {
                loading: "Saving…",
                success: "Saved",
                error: "Failed to save",
              },
            )
          }
        >
          Promise
        </Button>
      </div>
    </div>
  );
}
