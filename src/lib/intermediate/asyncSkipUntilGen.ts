/**
 * Creates an async generator that skips values from the input iterator until the callback returns true.
 *
 * @param it - The source async iterator.
 * @param callbackFn - A function that returns true when the generator should start yielding.
 * @returns An async generator that yields values once the condition is met.
 * @example
 * ```ts
 * const it = (async function*() { yield 1; yield 2; yield 3; yield 4; })();
 * const skipped = asyncSkipUntilGen(it, (x) => x === 3);
 * for await (const val of skipped) {
 *   console.log(val); // 3, 4
 * }
 * ```
 */
export async function* asyncSkipUntilGen<T>(
  it: AsyncIterator<T>,
  callbackFn: (value: T) => boolean,
): AsyncGenerator<T, any, undefined> {
  let result = await it.next();
  while (!result.done && !callbackFn(result.value)) {
    result = await it.next();
  }
  while (!result.done) {
    yield result.value;
    result = await it.next();
  }
}
