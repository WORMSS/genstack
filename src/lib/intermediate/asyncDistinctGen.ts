/**
 * Creates an async generator that yields unique values from the input iterator.
 *
 * @param it - The source async iterator.
 * @returns An async generator that yields distinct values.
 * @example
 * ```ts
 * const it = (async function*() { yield 1; yield 2; yield 1; })();
 * const distinct = asyncDistinctGen(it);
 * for await (const val of distinct) {
 *   console.log(val); // 1, 2
 * }
 * ```
 */
export async function* asyncDistinctGen<T>(
  it: AsyncIterator<T>,
): AsyncGenerator<T, any, undefined> {
  const set = new Set<T>();
  let result = await it.next();
  while (!result.done) {
    const value = result.value;
    const exists = set.has(value);
    set.add(value);
    if (!exists) {
      yield value;
    }
    result = await it.next();
  }
}
