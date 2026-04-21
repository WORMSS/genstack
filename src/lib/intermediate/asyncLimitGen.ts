/**
 * Creates an async generator that yields at most a specified number of values.
 *
 * @param input - The source iterator or async iterator.
 * @param limit - The maximum number of values to yield.
 * @returns An async generator that yields limited values.
 * @example
 * ```ts
 * const it = [1, 2, 3, 4, 5].values();
 * const limited = asyncLimitGen(it, 3);
 * for await (const val of limited) {
 *   console.log(val); // 1, 2, 3
 * }
 * ```
 */
export async function* asyncLimitGen<T>(
  input: Iterator<T> | AsyncIterator<T>,
  limit: number,
): AsyncGenerator<T, any, undefined> {
  let i = 0;
  while (i++ < limit) {
    let result = await input.next();
    if (result.done) {
      return;
    }
    yield result.value;
  }
}
