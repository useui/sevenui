"use client";

import * as React from "react";
import { CheckIcon, UserPlusIcon, XIcon } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/registry/base/ui/carousel";

const initialPeople = [
  {
    id: "priya",
    name: "Priya Raman",
    initials: "PR",
    role: "Product Designer",
    reason: "Commented on 4 files this week",
  },
  {
    id: "daniel",
    name: "Daniel Okafor",
    initials: "DO",
    role: "Frontend Engineer",
    reason: "Mentioned in #web-release",
  },
  {
    id: "lena",
    name: "Lena Fischer",
    initials: "LF",
    role: "Engineering Manager",
    reason: "Uses the same @northwind.io domain",
  },
  {
    id: "marco",
    name: "Marco Silva",
    initials: "MS",
    role: "QA Lead",
    reason: "Reviewed 2 shared prototypes",
  },
];

export default function Carousel12() {
  const [people, setPeople] = React.useState(initialPeople);
  const [invited, setInvited] = React.useState<string[]>([]);
  const [status, setStatus] = React.useState("");

  const invite = (id: string, name: string) => {
    setInvited((prev) => [...prev, id]);
    setStatus(`Invitation sent to ${name}.`);
  };

  const dismiss = (id: string, name: string) => {
    setPeople((prev) => prev.filter((person) => person.id !== id));
    setStatus(`${name} removed from suggestions.`);
  };

  return (
    <Carousel
      aria-labelledby="carousel-12-title"
      opts={{ align: "start" }}
      className="flex w-full max-w-md flex-col gap-3"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <h3 id="carousel-12-title" className="font-medium">
            Suggested teammates
          </h3>
          <p className="text-sm text-muted-foreground">
            {11 + invited.length} of 15 seats used
          </p>
        </div>
        {people.length > 0 && (
          <div className="flex gap-1">
            <CarouselPrevious className="static my-0" />
            <CarouselNext className="static my-0" />
          </div>
        )}
      </div>

      {people.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          No more suggestions. Invite people by email from Members.
        </p>
      ) : (
        <CarouselContent className="-ml-3">
          {people.map((person) => {
            const isInvited = invited.includes(person.id);
            return (
              <CarouselItem
                key={person.id}
                aria-label={person.name}
                className="basis-[72%] pl-3 sm:basis-1/2"
              >
                <div className="relative flex h-full flex-col items-center gap-3 rounded-xl border bg-card p-4 text-center text-card-foreground">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Dismiss ${person.name}`}
                    onClick={() => dismiss(person.id, person.name)}
                    className="absolute top-2 right-2 text-muted-foreground"
                  >
                    <XIcon aria-hidden="true" />
                  </Button>
                  <Avatar size="lg" className="mt-2">
                    <AvatarImage src="/placeholder.svg" alt="" />
                    <AvatarFallback>{person.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{person.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {person.role}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {person.reason}
                  </p>
                  <Button
                    size="sm"
                    variant={isInvited ? "secondary" : "outline"}
                    disabled={isInvited}
                    onClick={() => invite(person.id, person.name)}
                    className="mt-auto w-full"
                  >
                    {isInvited ? (
                      <CheckIcon aria-hidden="true" />
                    ) : (
                      <UserPlusIcon aria-hidden="true" />
                    )}
                    {isInvited ? "Invited" : "Invite"}
                  </Button>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      )}
      <p className="sr-only" aria-live="polite">
        {status}
      </p>
    </Carousel>
  );
}
