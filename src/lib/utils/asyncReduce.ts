/**
 * Reduces an async iterator to a single value using a callback function.
 *
 * @param it - The async iterator to reduce.
 * @param callbackFn - A function that is called for each element in the iterator.
 * @param initialValue - The initial value for the reduction. If not provided, the first element of the iterator is used.
 * @returns A promise that resolves to the reduced value.
 * @example
 * ```ts
 * const it = (async function*() { yield 1; yield 2; yield 3; })();
 * const sum = await asyncReduce(it, (a, b) => a + b, 0); // 6
 * ```
 */
export async function asyncReduce<T, U = T>(
  it: AsyncIterator<T>,
  callbackFn: (previous: U, current: T) => U | PromiseLike<U>,
  initialValue?: U,
): Promise<U> {
  let prev: U = initialValue === undefined ? (await it.next())?.value : initialValue;
  let currResult = await it.next();

  while (!currResult.done) {
    prev = await callbackFn(prev, currResult.value);
    currResult = await it.next();
  }

  return prev;
}
