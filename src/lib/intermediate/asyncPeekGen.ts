/**
 * Creates an async generator that performs a side effect for each value without modifying the stream.
 *
 * @param it - The source async iterator.
 * @param callbackFn - A function to execute for each value.
 * @returns An async generator that yields the original values.
 * @example
 * ```ts
 * const it = (async function*() { yield 1; yield 2; })();
 * const peeked = asyncPeekGen(it, (x) => console.log(`Peeking: ${x}`));
 * for await (const val of peeked) {
 *   // Logs: "Peeking: 1", then yields 1, then logs "Peeking: 2", then yields 2
 * }
 * ```
 */
export async function* asyncPeekGen<T>(
  it: AsyncIterator<T>,
  callbackFn: (value: T) => void,
): AsyncGenerator<T, any, undefined> {
  let result = await it.next();
  while (!result.done) {
    try {
      callbackFn(result.value);
    } catch (e) {}
    yield result.value;
    result = await it.next();
  }
}
