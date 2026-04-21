import { assertIterator } from '../guards/assertIterator.ts';
import { isIterable } from '../guards/isIterable.ts';

/**
 * Normalizes an iterator or iterable into an iterator.
 *
 * @param obj - The object to get an iterator from.
 * @returns An iterator.
 * @example
 * ```ts
 * const it = getIterator([1, 2, 3]);
 * ```
 */
export function getIterator<T>(obj: Iterator<T> | Iterable<T>): Iterator<T> {
  let it: Iterator<T>;
  if (isIterable(obj)) {
    it = obj[Symbol.iterator]();
  } else {
    it = obj;
  }
  assertIterator(it);
  return it;
}
