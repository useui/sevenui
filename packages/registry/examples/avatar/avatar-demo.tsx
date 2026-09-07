import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/registry/base/ui/avatar";

export default function AvatarDemo() {
  return (
    <div className="flex items-center gap-4">
      <Avatar size="sm">
        <AvatarFallback>EC</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="/logomark.svg" alt="SevenUI" />
        <AvatarFallback>7U</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>JL</AvatarFallback>
        <AvatarBadge aria-label="Online" className="bg-green-500" />
      </Avatar>
    </div>
  );
}
