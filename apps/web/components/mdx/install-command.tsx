import { PACKAGE_MANAGERS, type PackageManager } from "../../lib/package-manager";
import { installCommand } from "../../lib/registry";
import { highlight } from "../../lib/shiki";
import { PackageManagerMenu } from "../package-manager-menu";
import { CodeBlock } from "./code-block";
import { CODE_CLASS, cx } from "./code-element";

export async function InstallCommand({ item }: { item: string }) {
  const variants = await Promise.all(
    PACKAGE_MANAGERS.map(async (pm) => {
      const command = installCommand(item, pm);
      const html = await highlight(command, "bash", "inline");
      return { pm, command, html };
    }),
  );

  const commands = Object.fromEntries(variants.map(({ pm, command }) => [pm, command])) as Record<
    PackageManager,
    string
  >;

  return (
    <CodeBlock language="bash" headerRight={<PackageManagerMenu />} installCommands={commands}>
      {variants.map(({ pm, html }) => (
        <code
          key={pm}
          className={cx(CODE_CLASS, `pm-only pm-only-${pm} shiki`)}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: build-time Shiki output from our own sources
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ))}
    </CodeBlock>
  );
}
