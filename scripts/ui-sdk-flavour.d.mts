// Types for the parts of scripts/ui-sdk-flavour.mjs that TypeScript files may
// import (packages/registry/vitest.config.ts, tests/api-freeze.test.ts), so the
// rule "imports nothing UI SDK replaces" has one definition.

/** Matches every import form of a library UI SDK replaces; group 2 is the specifier. */
export const REPLACED_IMPORT: RegExp;
/** The replaced libraries a source imports, in any form. */
export function replacedImports(source: string): string[];
/** Whether a source imports, in any form, a library UI SDK replaces. */
export function importsReplaced(source: string): boolean;
/** A primitive description in UI SDK terms ("the Base UI X primitive" -> "the UI SDK X component"). */
export function describeUiSdk(description: string): string;
/** Docs page ledes describeUiSdk cannot rewrite, keyed by primitive. */
export const UI_SDK_LEDES: Record<string, string>;
