/**
 * Creates an infinite generator that yields values from a provided generator function.
 *
 * @param generator - A function that returns a value to be yielded.
 * @returns An infinite generator.
 *
 * @example
 * ```typescript
 * const gen = createGenerator(() => Math.random());
 * for (const val of gen) {
 *   console.log(val);
 *   if (val > 0.9) break;
 * }
 * ```
 */
export function* createGenerator<T>(generator: () => T): Generator<T> {
  while (true) {
    yield generator();
  }
}
