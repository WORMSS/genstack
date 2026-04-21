/**
 * Reduces an iterator to a single value using a callback function.
 *
 * @param it - The iterator to reduce.
 * @param callbackFn - A function that is called for each element in the iterator.
 * @param initialValue - The initial value for the reduction. If not provided, the first element of the iterator is used.
 * @returns The reduced value.
 * @example
 * ```ts
 * const sum = reduce([1, 2, 3][Symbol.iterator](), (a, b) => a + b, 0); // 6
 * ```
 */
export function reduce<T, U = T>(
  it: Iterator<T>,
  callbackFn: (previous: U, current: T) => U,
  initialValue?: U,
): U {
  let prev: U = initialValue === undefined ? it.next()?.value : initialValue;
  let currResult = it.next();

  while (!currResult.done) {
    prev = callbackFn(prev, currResult.value);
    currResult = it.next();
  }

  return prev;
}
