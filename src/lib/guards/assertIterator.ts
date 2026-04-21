import { isIterator } from './isIterator.ts';

/**
 * Asserts that the given object is an Iterator.
 * Throws a TypeError if the object is not an Iterator.
 *
 * @param obj - The object to check.
 * @returns {void}
 * @throws {TypeError} If the object is not an Iterator.
 * @example
 * const myIter = [1, 2, 3].values();
 * assertIterator(myIter); // OK
 * assertIterator({}); // Throws TypeError
 */
export function assertIterator<T>(obj: unknown): asserts obj is Iterator<T> {
  if (!isIterator(obj)) {
    throw new TypeError(`${String(obj)} is not an Iterator`);
  }
}
