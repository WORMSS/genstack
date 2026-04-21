/**
 * Creates an async generator that yields values from the input iterator that satisfy the predicate.
 *
 * @param input - The source iterator or async iterator.
 * @param predicate - A function to test each value.
 * @returns An async generator that yields filtered values.
 * @example
 * ```ts
 * const it = [1, 2, 3, 4].values();
 * const filtered = asyncFilterGen(it, async (x) => x % 2 === 0);
 * for await (const val of filtered) {
 *   console.log(val); // 2, 4
 * }
 * ```
 */
export async function* asyncFilterGen<T>(
  input: Iterator<T> | AsyncIterator<T>,
  predicate: (value: T) => unknown | PromiseLike<unknown>,
): AsyncGenerator<T, any, undefined> {
  let result = await input.next();
  while (!result.done) {
    const value = result.value;
    if (await predicate(value)) {
      yield value;
    }
    result = await input.next();
  }
}
