import { FLAVOURS, type Flavour } from "../../lib/flavour";
import { isFlavouredItem, isPrimitive } from "../../lib/flavour-items";
import { PACKAGE_MANAGERS, type PackageManager } from "../../lib/package-manager";
import { installCommand } from "../../lib/registry";
import { highlight } from "../../lib/shiki";
import { FlavourSwitch } from "../flavour/flavour-switch";
import { UiSdkPrimitiveNote } from "../flavour/ui-sdk-primitive-note";
import { PackageManagerMenu } from "../package-manager-menu";
import { CodeBlock } from "./code-block";
import { CODE_CLASS, cx } from "./code-element";

/** `plain` leaves out the UI SDK notes a primitive's own page shows under its command (the guides use it). */
export async function InstallCommand({ item, plain = false }: { item: string; plain?: boolean }) {
  const flavoured = isFlavouredItem(item);
  // Every flavour × package manager pair is rendered; CSS shows the reader's pair (globals.css).
  const variants = await Promise.all(
    FLAVOURS.flatMap((flavour) =>
      PACKAGE_MANAGERS.map(async (pm) => {
        const command = installCommand(item, pm, flavour, flavoured);
        const html = await highlight(command, "bash", "inline");
        return { flavour, pm, command, html };
      }),
    ),
  );

  const commands = Object.fromEntries(
    FLAVOURS.map((flavour) => [
      flavour,
      Object.fromEntries(variants.filter((v) => v.flavour === flavour).map(({ pm, command }) => [pm, command])),
    ]),
  ) as Record<Flavour, Record<PackageManager, string>>;

  return (
    <>
      <CodeBlock
        language="bash"
        headerRight={
          <>
            {flavoured && <FlavourSwitch className="me-1" mirror />}
            <PackageManagerMenu />
          </>
        }
        installCommands={commands}
      >
        {variants
          .filter(({ flavour }) => flavoured || flavour === "base-ui")
          .map(({ flavour, pm, html }) => (
            <code
              key={`${flavour}-${pm}`}
              className={cx(CODE_CLASS, `pm-only pm-only-${pm} shiki`, flavoured && `flavour-only-${flavour}`)}
              // biome-ignore lint/security/noDangerouslySetInnerHtml: build-time Shiki output from our own sources
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ))}
      </CodeBlock>
      {isPrimitive(item) && !plain && <UiSdkPrimitiveNote />}
    </>
  );
}
