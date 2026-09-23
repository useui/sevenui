import * as React from "react";

export const CODE_CLASS = "block max-h-96 overflow-auto px-5 pb-1.5";

export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

type CodeProps = { className?: string; tabIndex?: number };

// Runs on the server, where MDX's <pre> children are still real elements, and
// prepares the <code> the client CodeBlock renders untouched.
export function prepareCodeChild(children: React.ReactNode): { language?: string; code: React.ReactNode } {
  if (!React.isValidElement<CodeProps>(children)) return { code: children };
  const language = /(?:^|\s)language-(\w+)/.exec(children.props.className ?? "")?.[1];
  const code = React.cloneElement(children, {
    tabIndex: 0,
    className: cx(CODE_CLASS, children.props.className),
  });
  return { language, code };
}
