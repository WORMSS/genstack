/**
 * Wraps an iterator into an iterable.
 *
 * @param it - The iterator to wrap.
 * @returns An iterable.
 * @example
 * ```ts
 * const iterable = wrapToIterable(iterator);
 * for (const x of iterable) { ... }
 * ```
 */
export function wrapToIterable<T>(it: Iterator<T>): Iterable<T> {
  return {
    [Symbol.iterator]() {
      return it;
    },
  };
}
