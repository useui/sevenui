import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";

export default function KbdDemo() {
  return (
    <p className="text-sm text-muted-foreground">
      Press{" "}
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>{" "}
      to open the command menu.
    </p>
  );
}
