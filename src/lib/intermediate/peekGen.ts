/**
 * Creates a generator that performs a side effect for each value without modifying the stream.
 *
 * @param it - The source iterator.
 * @param callbackFn - A function to execute for each value.
 * @returns A generator that yields the original values.
 * @example
 * ```ts
 * const it = [1, 2].values();
 * const peeked = peekGen(it, (x) => console.log(`Peeking: ${x}`));
 * for (const val of peeked) {
 *   // Logs: "Peeking: 1", then yields 1, then logs "Peeking: 2", then yields 2
 * }
 * ```
 */
export function* peekGen<T>(
  it: Iterator<T>,
  callbackFn: (value: T) => void,
): Generator<T, any, undefined> {
  let result = it.next();
  while (!result.done) {
    try {
      callbackFn(result.value);
    } catch (e) {}
    yield result.value;
    result = it.next();
  }
}
