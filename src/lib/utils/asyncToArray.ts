/**
 * Converts an async iterator into an array.
 *
 * @param it - The async iterator to convert.
 * @returns A promise that resolves to an array containing all elements from the iterator.
 * @example
 * ```ts
 * const it = (async function*() { yield 1; yield 2; })();
 * const arr = await asyncToArray(it); // [1, 2]
 * ```
 */
export async function asyncToArray<T>(it: AsyncIterator<T>): Promise<T[]> {
  const values = [];
  let result = await it.next();
  while (!result.done) {
    values.push(result.value);
    result = await it.next();
  }
  return values;
}
