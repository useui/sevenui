import * as React from "react";
import type { MDXComponents } from "mdx/types";
import { UiSdkApiReference } from "./components/flavour/ui-sdk-primitive-note";
import { CodeBlock } from "./components/mdx/code-block";
import { prepareCodeChild } from "./components/mdx/code-element";
import { Component } from "./components/mdx/component";
import { InstallCommand } from "./components/mdx/install-command";
import { PrimitiveIndex } from "./components/mdx/primitive-index";

function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

/** The Base UI prose of a primitive's API reference; lib/mdx/remark-flavour-api.mjs wraps it. */
function BaseUiOnly({ children }: { children?: React.ReactNode }) {
  return <div className="flavour-only-base-ui">{children}</div>;
}

function P({ className, ...props }: React.ComponentPropsWithoutRef<"p">) {
  return <p className={cx("my-3.5 font-medium text-base text-muted-foreground leading-[22px]", className)} {...props} />;
}

const HEADING_ANCHOR_CLASSES =
  "text-inherit font-inherit no-underline after:content-['#'] after:ms-[0.35em] after:text-muted-foreground after:opacity-0 after:transition-opacity after:duration-150 hover:after:opacity-100 focus-visible:after:opacity-100";

function withHeadingAnchor(children: React.ReactNode): React.ReactNode {
  if (!React.isValidElement(children)) return children;
  return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
    className: HEADING_ANCHOR_CLASSES,
  });
}

function H2({ className, children, ...props }: React.ComponentPropsWithoutRef<"h2">) {
  return (
    <h2
      className={cx(
        "mt-14 mb-2.5 font-display text-xl leading-[26px] font-medium tracking-normal text-foreground break-words first:mt-0",
        className,
      )}
      {...props}
    >
      {withHeadingAnchor(children)}
    </h2>
  );
}

function H3({ className, children, ...props }: React.ComponentPropsWithoutRef<"h3">) {
  return (
    <h3
      className={cx(
        "mt-8 mb-2 font-display text-base leading-6 font-medium tracking-normal text-foreground break-words [h2+&]:mt-0",
        className,
      )}
      {...props}
    >
      {withHeadingAnchor(children)}
    </h3>
  );
}

const DEFAULT_A_CLASSES =
  "font-medium text-foreground underline decoration-1 decoration-dotted underline-offset-[0.2em]";

function A({ className, ...props }: React.ComponentPropsWithoutRef<"a">) {
  return <a className={className ?? DEFAULT_A_CLASSES} {...props} />;
}

function Strong({ className, ...props }: React.ComponentPropsWithoutRef<"strong">) {
  return <strong className={cx("font-semibold text-foreground", className)} {...props} />;
}

const INLINE_CODE_CLASSES =
  "rounded-[0.3rem] bg-[oklch(0.99_0_0)] px-[0.35em] py-[0.15em] font-mono text-[0.875em] font-medium text-foreground dark:bg-[oklch(0.12_0_0)]";

const Code = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<"code">>(function Code(
  { children, className, ...props },
  ref,
) {
  const isInline = typeof children === "string";
  return (
    <code ref={ref} className={isInline ? cx(INLINE_CODE_CLASSES, className) : className} {...props}>
      {children}
    </code>
  );
});

const TABLE_WRAPPER_CLASSES =
  "my-6 overflow-x-auto rounded-md border border-border [&>table]:m-0 [&_th]:whitespace-nowrap [&_th]:px-3 [&_th]:py-2 [&_td]:px-3 [&_td]:py-2";

function Table({ className, ...props }: React.ComponentPropsWithoutRef<"table">) {
  return (
    <div className={TABLE_WRAPPER_CLASSES}>
      <table className={cx("w-full border-collapse text-[0.8125rem] leading-[22.2858px]", className)} {...props} />
    </div>
  );
}

function Th({ className, ...props }: React.ComponentPropsWithoutRef<"th">) {
  return <th className={cx("text-start font-semibold text-foreground", className)} {...props} />;
}

function Td({ className, ...props }: React.ComponentPropsWithoutRef<"td">) {
  return <td className={cx("text-[0.8125rem] text-muted-foreground leading-[22.2858px]", className)} {...props} />;
}

function Ul({ className, ...props }: React.ComponentPropsWithoutRef<"ul">) {
  return <ul className={cx("my-4 list-disc ps-[1.625em]", className)} {...props} />;
}

function Li({ className, ...props }: React.ComponentPropsWithoutRef<"li">) {
  return (
    <li
      className={cx("my-1.5 ps-[0.375em] font-medium text-base text-muted-foreground leading-[22px]", className)}
      {...props}
    />
  );
}

function Pre({ children, ...props }: React.ComponentPropsWithoutRef<"pre">) {
  const { language, code } = prepareCodeChild(children);
  return (
    <CodeBlock {...props} language={language}>
      {code}
    </CodeBlock>
  );
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    p: P,
    h2: H2,
    h3: H3,
    a: A,
    strong: Strong,
    code: Code,
    pre: Pre,
    table: Table,
    th: Th,
    td: Td,
    ul: Ul,
    li: Li,
    InstallCommand,
    Component,

    PrimitiveIndex,
    BaseUiOnly,
    UiSdkApiReference,
  };
}
