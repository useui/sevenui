# SevenUI

SevenUI is a React component library built exclusively on
[Base UI](https://base-ui.com) primitives — no Radix underneath.
Components are distributed as source through the shadcn registry, so
you install them directly into your project instead of adding a
runtime package to your dependency tree.

## Installation

Add the registry to your `components.json`:

```json
{
  "registries": {
    "@sevenui": "https://sevenui.dev/r/{name}.json"
  }
}
```

Then add a component:

```bash
npx shadcn@latest add @sevenui/button
```

See [sevenui.dev](https://sevenui.dev) for the full component list,
installation guide, and theming docs.

## Development

```bash
pnpm install
pnpm dev
pnpm build
pnpm test:smoke
```

## License

MIT
