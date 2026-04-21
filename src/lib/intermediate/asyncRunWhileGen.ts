/**
 * Creates an async generator that yields values as long as the callback returns true.
 *
 * @param it - The source async iterator.
 * @param callbackFn - A function that returns true while the generator should continue.
 * @returns An async generator that yields values while the condition is met.
 * @example
 * ```ts
 * const it = (async function*() { yield 1; yield 2; yield 3; yield 4; })();
 * const whileLessThan3 = asyncRunWhileGen(it, (x) => x < 3);
 * for await (const val of whileLessThan3) {
 *   console.log(val); // 1, 2
 * }
 * ```
 */
export async function* asyncRunWhileGen<T>(
  it: AsyncIterator<T>,
  callbackFn: (value: T) => boolean,
): AsyncGenerator<T, any, undefined> {
  let result = await it.next();
  while (!result.done && callbackFn(result.value)) {
    yield result.value;
    result = await it.next();
  }
}
