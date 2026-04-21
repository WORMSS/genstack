/**
 * Creates a generator that yields values as long as the callback returns true.
 *
 * @param it - The source iterator.
 * @param callbackFn - A function that returns true while the generator should continue.
 * @returns A generator that yields values while the condition is met.
 * @example
 * ```ts
 * const it = [1, 2, 3, 4].values();
 * const whileLessThan3 = runWhileGen(it, (x) => x < 3);
 * for (const val of whileLessThan3) {
 *   console.log(val); // 1, 2
 * }
 * ```
 */
export function* runWhileGen<T>(
  it: Iterator<T>,
  callbackFn: (value: T) => boolean,
): Generator<T, any, undefined> {
  let result = it.next();
  while (!result.done && callbackFn(result.value)) {
    yield result.value;
    result = it.next();
  }
}
