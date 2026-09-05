import { Avatar, AvatarImage, AvatarFallback } from "@/registry/base/ui/avatar";

export default function AvatarDemo() {
  return (
    <div className="flex gap-4 items-center">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="" alt="@broken" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    </div>
  );
}
