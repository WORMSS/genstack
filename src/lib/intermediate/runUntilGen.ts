/**
 * Creates a generator that yields values until the callback returns true.
 *
 * @param it - The source iterator.
 * @param callbackFn - A function that returns true when the generator should stop.
 * @returns A generator that yields values until the condition is met.
 * @example
 * ```ts
 * const it = [1, 2, 3, 4].values();
 * const until3 = runUntilGen(it, (x) => x === 3);
 * for (const val of until3) {
 *   console.log(val); // 1, 2
 * }
 * ```
 */
export function* runUntilGen<T>(
  it: Iterator<T>,
  callbackFn: (value: T) => boolean,
): Generator<T, any, undefined> {
  let result = it.next();
  while (!result.done && !callbackFn(result.value)) {
    yield result.value;
    result = it.next();
  }
}
