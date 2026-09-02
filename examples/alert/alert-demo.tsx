import { Alert, AlertDescription, AlertTitle } from "@/registry/base/ui/alert";

export default function AlertDemo() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <Alert>
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can add components to your app using the shadcn CLI.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>Your session has expired.</AlertDescription>
      </Alert>
    </div>
  );
}
