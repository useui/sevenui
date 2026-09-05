import { Button } from "@/registry/base/ui/button";
import { Spinner } from "@/registry/base/ui/spinner";

export default function SpinnerDemo() {
  return (
    <div className="flex items-center gap-4">
      <Spinner />
      <Button disabled>
        <Spinner />
        Loading…
      </Button>
    </div>
  );
}
