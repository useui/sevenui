import * as React from "react";

// No overflow here: CodeBlock's scroll area owns scrolling and the tab stop. w-max keeps long lines unwrapped;
// pb-3 is the lane the horizontal scrollbar overlays, so it never covers the last line.
export const CODE_CLASS = "block w-max min-w-full px-5 pb-3";

export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

type CodeProps = { className?: string };

// Runs on the server, where MDX's <pre> children are still real elements, and
// prepares the <code> the client CodeBlock renders untouched.
export function prepareCodeChild(children: React.ReactNode): { language?: string; code: React.ReactNode } {
  if (!React.isValidElement<CodeProps>(children)) return { code: children };
  const language = /(?:^|\s)language-(\w+)/.exec(children.props.className ?? "")?.[1];
  const code = React.cloneElement(children, {
    className: cx(CODE_CLASS, children.props.className),
  });
  return { language, code };
}
