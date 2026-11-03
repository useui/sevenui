/** Narrow a nullable lookup, failing the test with a readable message when it is missing. */
export function must<T>(value: T | null | undefined, what = "value"): T {
  if (value === null || value === undefined) throw new Error(`expected ${what} to exist`);
  return value;
}
