/**
 * A type guard that filters out null and undefined values.
 *
 * @param n - The value to check.
 * @returns True if the value is neither null nor undefined.
 * @example
 * ```ts
 * const values = [1, null, undefined, 2].filter(filterNullUndefined); // [1, 2]
 * ```
 */
export function filterNullUndefined<T>(n: T): n is Exclude<T, null | undefined> {
  return n !== null && n !== undefined;
}
