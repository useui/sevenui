"use client";

import * as React from "react";
import { CodeBlock } from "../mdx/code-block";
import { CODE_CLASS, cx } from "../mdx/code-element";
import { CodeWantedContext } from "./demo-tabs";

type State = { status: "idle" | "loading" } | { status: "ready"; html: string } | { status: "error" };

/**
 * A Code tab pane that fetches its highlighted source (see app/components/[name]/code) the first
 * time DemoTabs reports the Code tab wanted, instead of shipping it inside the page.
 */
export function LazyCode({ src, rawHref }: { src: string; rawHref: string }) {
  const wanted = React.useContext(CodeWantedContext);
  const [state, setState] = React.useState<State>({ status: "idle" });

  React.useEffect(() => {
    if (!wanted || state.status !== "idle") return;
    setState({ status: "loading" });
    fetch(src)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then((html) => setState({ status: "ready", html }))
      .catch(() => setState({ status: "error" }));
  }, [wanted, src, state.status]);

  if (state.status === "error") {
    return (
      <p className="px-5 py-8 text-sm text-muted-foreground">
        The source could not be loaded.{" "}
        <a className="underline underline-offset-4 hover:text-foreground" href={rawHref}>
          Open the registry item
        </a>{" "}
        instead.
      </p>
    );
  }

  return (
    <CodeBlock aria-busy={state.status !== "ready"} className="my-0! rounded-none! border-0!" language="tsx">
      {state.status === "ready" ? (
        <code
          className={cx(CODE_CLASS, "language-tsx shiki")}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: build-time Shiki output from our own sources
          dangerouslySetInnerHTML={{ __html: state.html }}
        />
      ) : (
        <code className={cx(CODE_CLASS, "text-muted-foreground")}>Loading source…</code>
      )}
    </CodeBlock>
  );
}
