/**
 * Creates an async generator that transforms each value from the input iterator.
 *
 * @param input - The source iterator or async iterator.
 * @param callbackfn - A function that transforms each value.
 * @returns An async generator that yields transformed values.
 * @example
 * ```ts
 * const it = [1, 2, 3].values();
 * const mapped = asyncMapGen(it, (x) => x * 2);
 * for await (const val of mapped) {
 *   console.log(val); // 2, 4, 6
 * }
 * ```
 */
export async function* asyncMapGen<T, U>(
  input: Iterator<T> | AsyncIterator<T>,
  callbackfn: (value: T) => U | PromiseLike<U>,
): AsyncGenerator<U, any, undefined> {
  let result = await input.next();
  while (!result.done) {
    yield callbackfn(result.value);
    result = await input.next();
  }
}
