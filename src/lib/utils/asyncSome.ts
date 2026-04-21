/**
 * Checks if any element in the async iterator satisfies the predicate.
 *
 * @param it - The async iterator to check.
 * @param predicate - A function to test each element.
 * @returns A promise that resolves to true if any element satisfies the predicate, false otherwise.
 * @example
 * ```ts
 * const it = (async function*() { yield 1; yield 2; yield 3; })();
 * const hasEven = await asyncSome(it, (x) => x % 2 === 0); // true
 * ```
 */
export async function asyncSome<T>(
  it: AsyncIterator<T>,
  predicate: (item: T, index: number) => unknown | PromiseLike<unknown>,
): Promise<boolean> {
  let index = 0;
  let result = await it.next();

  while (!result.done) {
    if (!!(await predicate(result.value, index++))) {
      return true;
    }
    result = await it.next();
  }

  return false;
}
