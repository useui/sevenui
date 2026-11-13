"use client";

import * as React from "react";
import { registryJsonPath } from "../../lib/flavour";
import { CodeBlock } from "../mdx/code-block";
import { useFlavour } from "../flavour/use-flavour";
import { CODE_CLASS, cx } from "../mdx/code-element";
import { CodeWantedContext } from "./demo-tabs";

type State = { status: "idle" | "loading" } | { status: "ready"; html: string } | { status: "error" };

/**
 * A Code tab pane that fetches its highlighted source (see app/components/[name]/code) the first
 * time DemoTabs reports the Code tab wanted, instead of shipping it inside the page.
 */
export function LazyCode({ id, src, uiSdkSrc }: { id: string; src: string; uiSdkSrc?: string }) {
  const wanted = React.useContext(CodeWantedContext);
  const flavour = useFlavour();
  const [state, setState] = React.useState<State>({ status: "idle" });
  // The flavour's own source when it has one; a change of flavour starts the fetch over.
  const url = flavour === "ui-sdk" && uiSdkSrc ? uiSdkSrc : src;
  const rawHref = registryJsonPath(`component/${id}`, flavour);
  const [loadedUrl, setLoadedUrl] = React.useState(url);
  if (loadedUrl !== url) {
    setLoadedUrl(url);
    setState({ status: "idle" });
  }

  const urlRef = React.useRef(url);
  urlRef.current = url;

  React.useEffect(() => {
    if (!wanted || state.status !== "idle") return;
    setState({ status: "loading" });
    // A reply for a flavour the reader has since left is dropped.
    const settle = (next: State) => {
      if (urlRef.current === url) setState(next);
    };
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then((html) => settle({ status: "ready", html }))
      .catch(() => settle({ status: "error" }));
  }, [wanted, url, state.status]);

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
    <CodeBlock aria-busy={state.status !== "ready"} bare language="tsx">
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
