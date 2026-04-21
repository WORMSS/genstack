/**
 * Creates a generator that skips a specified number of values from the input iterator.
 *
 * @param it - The source iterator.
 * @param skip - The number of values to skip.
 * @returns A generator that yields the remaining values.
 * @example
 * ```ts
 * const it = [1, 2, 3, 4, 5].values();
 * const skipped = skipGen(it, 2);
 * for (const val of skipped) {
 *   console.log(val); // 3, 4, 5
 * }
 * ```
 */
export function* skipGen<T>(it: Iterator<T>, skip: number): Generator<T, any, undefined> {
  let i = 0;
  let result = it.next();
  while (!result.done && i++ < skip) {
    result = it.next();
  }
  while (!result.done) {
    yield result.value;
    result = it.next();
  }
}
