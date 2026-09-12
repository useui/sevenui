"use client";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";

const members = [
  { name: "Emma Wilson", role: "Product Designer", initials: "EW" },
  { name: "James Carter", role: "Frontend Engineer", initials: "JC" },
  { name: "Sofia Reyes", role: "Product Manager", initials: "SR" },
];

export default function Card03() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Team members</CardTitle>
        <CardDescription>People with access to this project.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {members.map((member) => (
          <div key={member.name} className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{member.initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{member.name}</span>
              <span className="text-xs text-muted-foreground">{member.role}</span>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Invite
        </Button>
      </CardFooter>
    </Card>
  );
}
