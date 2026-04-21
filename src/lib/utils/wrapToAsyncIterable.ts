/**
 * Wraps an async iterator into an async iterable.
 *
 * @param it - The async iterator to wrap.
 * @returns An async iterable.
 * @example
 * ```ts
 * const iterable = wrapToAsyncIterable(asyncIterator);
 * for await (const x of iterable) { ... }
 * ```
 */
export function wrapToAsyncIterable<T>(it: AsyncIterator<T>): AsyncIterable<T> {
  return {
    [Symbol.asyncIterator]() {
      return it;
    },
  };
}
