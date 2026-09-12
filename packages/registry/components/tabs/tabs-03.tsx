"use client";

import { Badge } from "@/registry/base/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

const folders = [
  {
    value: "inbox",
    label: "Inbox",
    count: 12,
    body: "New messages waiting for a reply.",
  },
  {
    value: "drafts",
    label: "Drafts",
    count: 3,
    body: "Messages you started but haven't sent yet.",
  },
  {
    value: "sent",
    label: "Sent",
    count: 0,
    body: "Everything you've sent, most recent first.",
  },
];

export default function Tabs03() {
  return (
    <Tabs defaultValue="inbox" className="w-full max-w-md">
      <TabsList className="w-full">
        {folders.map((folder) => (
          <TabsTrigger key={folder.value} value={folder.value} className="flex-1">
            {folder.label}
            {folder.count > 0 && (
              <Badge variant="secondary" className="h-4.5 px-1.5">
                {folder.count}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      {folders.map((folder) => (
        <TabsContent key={folder.value} value={folder.value}>
          <p className="text-sm text-muted-foreground">{folder.body}</p>
        </TabsContent>
      ))}
    </Tabs>
  );
}
