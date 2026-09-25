"use client";

import { Alert, AlertDescription, AlertTitle } from "@/registry/base/ui/alert";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";

export default function Alert06() {
  return (
    <Alert
      role="status"
      className="w-full max-w-md grid-cols-[auto_1fr] gap-x-3 px-3 py-3"
    >
      <Avatar className="row-span-3">
        <AvatarImage src="/placeholder.svg" alt="" />
        <AvatarFallback>MR</AvatarFallback>
      </Avatar>
      <AlertTitle className="col-start-2">
        Maya Ruiz requested your review
      </AlertTitle>
      <AlertDescription className="col-start-2">
        Pull request 482 &ldquo;Migrate billing webhooks to queue
        workers&rdquo; is waiting on you. Due today.
      </AlertDescription>
      <div className="col-start-2 mt-2 flex flex-wrap gap-2">
        <Button size="xs">Start review</Button>
        <Button size="xs" variant="outline">
          Reassign
        </Button>
      </div>
    </Alert>
  );
}
