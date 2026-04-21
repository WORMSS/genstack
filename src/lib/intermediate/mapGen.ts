/**
 * Creates a generator that transforms each value from the input iterator.
 *
 * @param it - The source iterator.
 * @param callbackfn - A function that transforms each value.
 * @returns A generator that yields transformed values.
 * @example
 * ```ts
 * const it = [1, 2, 3].values();
 * const mapped = mapGen(it, (x) => x * 2);
 * for (const val of mapped) {
 *   console.log(val); // 2, 4, 6
 * }
 * ```
 */
export function* mapGen<T, U>(
  it: Iterator<T>,
  callbackfn: (value: T) => U,
): Generator<U, any, undefined> {
  let result = it.next();
  while (!result.done) {
    yield callbackfn(result.value);
    result = it.next();
  }
}
