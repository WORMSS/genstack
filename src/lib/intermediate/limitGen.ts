/**
 * Creates a generator that yields at most a specified number of values.
 *
 * @param it - The source iterator.
 * @param limit - The maximum number of values to yield.
 * @returns A generator that yields limited values.
 * @example
 * ```ts
 * const it = [1, 2, 3, 4, 5].values();
 * const limited = limitGen(it, 3);
 * for (const val of limited) {
 *   console.log(val); // 1, 2, 3
 * }
 * ```
 */
export function* limitGen<T>(it: Iterator<T>, limit: number): Generator<T, any, undefined> {
  let i = 0;

  let result: IteratorResult<T, any>;
  while (i++ < limit) {
    result = it.next();
    if (result.done) {
      return;
    }
    yield result.value;
  }
}
