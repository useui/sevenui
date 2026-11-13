// Gives every primitive page's "API reference" section a UI SDK counterpart without forking 66 MDX files.
// The section (from its h2 up to the next h2) is written about the Base UI flavour: base-ui.com links and
// Base UI's props. This plugin wraps that section's body in <BaseUiOnly> and puts <UiSdkApiReference name>
// beside it; CSS shows the one that matches the reader's flavour (lib/flavour.ts). The heading itself is
// shared, so the table of contents and its anchor stay put.
import path from "node:path";

const HEADING = "API reference";

function text(node) {
  if (node.type === "text" || node.type === "inlineCode") return node.value;
  return (node.children ?? []).map(text).join("");
}

export default function remarkFlavourApi() {
  return (tree, file) => {
    const filePath = file.path ?? file.history?.[0] ?? "";
    const dir = path.basename(path.dirname(filePath));
    if (dir !== "components" || !filePath.endsWith(".mdx")) return;
    const name = path.basename(filePath, ".mdx");

    const start = tree.children.findIndex(
      (node) => node.type === "heading" && node.depth === 2 && text(node).trim() === HEADING,
    );
    if (start === -1) return;
    let end = tree.children.findIndex((node, i) => i > start && node.type === "heading" && node.depth <= 2);
    if (end === -1) end = tree.children.length;

    const body = tree.children.slice(start + 1, end);
    tree.children.splice(
      start + 1,
      body.length,
      {
        type: "mdxJsxFlowElement",
        name: "UiSdkApiReference",
        attributes: [{ type: "mdxJsxAttribute", name: "name", value: name }],
        children: [],
      },
      { type: "mdxJsxFlowElement", name: "BaseUiOnly", attributes: [], children: body },
    );
  };
}
