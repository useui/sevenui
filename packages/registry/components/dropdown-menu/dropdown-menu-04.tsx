"use client";

import { FolderOpen, Trash2 } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";

const FOLDERS = ["Inbox", "Marketing", "Engineering", "Archive"];

export default function DropdownMenu04() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline">Actions</Button>} />
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem>Rename</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FolderOpen aria-hidden="true" />
            Move to…
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {FOLDERS.map((folder) => (
              <DropdownMenuItem key={folder}>{folder}</DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash2 aria-hidden="true" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
