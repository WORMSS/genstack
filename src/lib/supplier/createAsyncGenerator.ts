/**
 * Creates an infinite async generator that yields values from a provided generator function.
 *
 * @param generator - A function that returns a value or a promise of a value to be yielded.
 * @returns An infinite async generator.
 *
 * @example
 * ```typescript
 * const gen = createAsyncGenerator(() => Math.random());
 * for await (const val of gen) {
 *   console.log(val);
 *   if (val > 0.9) break;
 * }
 * ```
 */
export async function* createAsyncGenerator<T>(
  generator: () => PromiseLike<T> | T,
): AsyncGenerator<T> {
  while (true) {
    yield generator();
  }
}
