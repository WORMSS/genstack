/**
 * Creates a generator that skips values from the input iterator until the callback returns true.
 *
 * @param it - The source iterator.
 * @param callbackFn - A function that returns true when the generator should start yielding.
 * @returns A generator that yields values once the condition is met.
 * @example
 * ```ts
 * const it = [1, 2, 3, 4].values();
 * const skipped = skipUntilGen(it, (x) => x === 3);
 * for (const val of skipped) {
 *   console.log(val); // 3, 4
 * }
 * ```
 */
export function* skipUntilGen<T>(
  it: Iterator<T>,
  callbackFn: (value: T) => boolean,
): Generator<T, any, undefined> {
  let result = it.next();
  while (!result.done && !callbackFn(result.value)) {
    result = it.next();
  }
  while (!result.done) {
    yield result.value;
    result = it.next();
  }
}
