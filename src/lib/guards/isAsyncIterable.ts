import { hasPropertyFunction } from './hasPropertyFunction.ts';
import { isObject } from './isObject.ts';

/**
 * Checks if an object is an AsyncIterable.
 *
 * @param obj - The object to check.
 * @returns True if the object is an AsyncIterable, false otherwise.
 * @example
 * const asyncIter = {
 *   async *[Symbol.asyncIterator]() {
 *     yield 1;
 *   }
 * };
 * if (isAsyncIterable(asyncIter)) {
 *   // ...
 * }
 */
export function isAsyncIterable<T>(obj: unknown): obj is AsyncIterable<T> {
  return isObject(obj) && hasPropertyFunction(obj, Symbol.asyncIterator);
}
