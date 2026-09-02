import { Kbd } from "@/registry/base/ui/kbd";

export default function KbdDemo() {
  return (
    <p className="text-sm text-muted-foreground">
      Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to open the command menu.
    </p>
  );
}
