/**
 * Creates an async generator that skips a specified number of values from the input iterator.
 *
 * @param input - The source iterator or async iterator.
 * @param skip - The number of values to skip.
 * @returns An async generator that yields the remaining values.
 * @example
 * ```ts
 * const it = [1, 2, 3, 4, 5].values();
 * const skipped = asyncSkipGen(it, 2);
 * for await (const val of skipped) {
 *   console.log(val); // 3, 4, 5
 * }
 * ```
 */
export async function* asyncSkipGen<T>(
  input: Iterator<T> | AsyncIterator<T>,
  skip: number,
): AsyncGenerator<T, any, undefined> {
  let it = await input.next();
  let i = 0;
  while (!it.done && i++ < skip) {
    it = await input.next();
  }
  while (!it.done) {
    yield it.value;
    it = await input.next();
  }
}
