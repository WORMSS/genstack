/**
 * Checks if any element in the iterator satisfies the predicate.
 *
 * @param it - The iterator to check.
 * @param predicate - A function to test each element.
 * @returns True if any element satisfies the predicate, false otherwise.
 * @example
 * ```ts
 * const hasEven = some([1, 2, 3][Symbol.iterator](), (x) => x % 2 === 0); // true
 * ```
 */
export function some<T>(it: Iterator<T>, predicate: (value: T, index: number) => unknown): boolean {
  let index = 0;
  let result = it.next();

  while (!result.done) {
    if (!!predicate(result.value, index++)) {
      return true;
    }
    result = it.next();
  }

  return false;
}
