import { assertIterator } from '../guards/assertIterator.ts';
import { isAsyncIterable } from '../guards/isAsyncIterable.ts';
import { isIterable } from '../guards/isIterable.ts';
import { wrapToAsyncIterator } from './wrapToAsyncIterator.ts';

/**
 * Normalizes an iterator, iterable, async iterator, or async iterable into an async iterator.
 *
 * @param obj - The object to get an async iterator from.
 * @returns An async iterator.
 * @example
 * ```ts
 * const it = getAsyncIterator([1, 2, 3]);
 * ```
 */
export function getAsyncIterator<T>(
  obj: Iterator<T> | Iterable<T> | AsyncIterator<T> | AsyncIterable<T>,
): AsyncIterator<T> {
  let iterator: Iterator<T> | AsyncIterator<T>;
  if (isAsyncIterable(obj)) {
    iterator = obj[Symbol.asyncIterator]();
  } else if (isIterable(obj)) {
    iterator = obj[Symbol.iterator]();
  } else {
    iterator = obj;
  }
  assertIterator(iterator);
  return wrapToAsyncIterator(iterator);
}
