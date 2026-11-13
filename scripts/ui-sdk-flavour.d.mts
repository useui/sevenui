// Types for the parts of scripts/ui-sdk-flavour.mjs that TypeScript files
// import (packages/registry/vitest.config.ts, tests/api-freeze.test.ts), so the
// rule "imports nothing UI SDK replaces" has one definition.

/** Matches every import form of a library UI SDK replaces; group 2 is the specifier. */
export const REPLACED_IMPORT: RegExp;
/** The replaced libraries a source imports, in any form. */
export function replacedImports(source: string): string[];
/** Whether a source imports, in any form, a library UI SDK replaces. */
export function importsReplaced(source: string): boolean;
