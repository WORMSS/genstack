/**
 * A type guard that filters out null values.
 *
 * @param n - The value to check.
 * @returns True if the value is not null.
 * @example
 * ```ts
 * const values = [1, null, 2].filter(filterNull); // [1, 2]
 * ```
 */
export function filterNull<T>(n: T): n is Exclude<T, null> {
  return n !== null;
}
