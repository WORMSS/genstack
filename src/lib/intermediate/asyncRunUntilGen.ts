/**
 * Creates an async generator that yields values until the callback returns true.
 *
 * @param it - The source async iterator.
 * @param callbackFn - A function that returns true when the generator should stop.
 * @returns An async generator that yields values until the condition is met.
 * @example
 * ```ts
 * const it = (async function*() { yield 1; yield 2; yield 3; yield 4; })();
 * const until3 = asyncRunUntilGen(it, (x) => x === 3);
 * for await (const val of until3) {
 *   console.log(val); // 1, 2
 * }
 * ```
 */
export async function* asyncRunUntilGen<T>(
  it: AsyncIterator<T>,
  callbackFn: (value: T) => boolean,
): AsyncGenerator<T, any, undefined> {
  let result = await it.next();
  while (!result.done && !callbackFn(result.value)) {
    yield result.value;
    result = await it.next();
  }
}
