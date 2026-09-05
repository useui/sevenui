import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";

export default function Hero01() {
  return (
    <section className="w-full bg-background">
      <div className="mx-auto flex min-h-[480px] max-w-3xl flex-col items-center justify-center gap-6 px-6 py-20 text-center">
        <Badge variant="secondary">Now in public beta</Badge>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Ship accessible interfaces in a fraction of the time
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground text-balance">
          Production-ready components and blocks you copy into your codebase
          and own outright. Built on Base UI, styled with your theme.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg">Get started</Button>
          <Button size="lg" variant="outline">
            View components
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Free and open source. No signup required.
        </p>
      </div>
    </section>
  );
}
