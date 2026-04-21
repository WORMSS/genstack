/**
 * Creates a generator that yields unique values from the input iterator.
 *
 * @param it - The source iterator.
 * @returns A generator that yields distinct values.
 * @example
 * ```ts
 * const it = [1, 2, 1, 3, 2].values();
 * const distinct = distinctGen(it);
 * for (const val of distinct) {
 *   console.log(val); // 1, 2, 3
 * }
 * ```
 */
export function* distinctGen<T>(it: Iterator<T>): Generator<T, any, undefined> {
  const set = new Set<T>();
  let result = it.next();
  while (!result.done) {
    const value = result.value;
    const exists = set.has(value);
    set.add(value);
    if (!exists) {
      yield value;
    }
    result = it.next();
  }
}
