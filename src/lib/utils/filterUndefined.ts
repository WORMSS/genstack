/**
 * A type guard that filters out undefined values.
 *
 * @param n - The value to check.
 * @returns True if the value is not undefined.
 * @example
 * ```ts
 * const values = [1, undefined, 2].filter(filterUndefined); // [1, 2]
 * ```
 */
export function filterUndefined<T>(n: T): n is Exclude<T, undefined> {
  return n !== undefined;
}
