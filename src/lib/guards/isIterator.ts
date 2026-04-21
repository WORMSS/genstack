import { hasPropertyFunction } from './hasPropertyFunction.ts';
import { isObject } from './isObject.ts';

/**
 * Checks if an object is an Iterator or AsyncIterator.
 *
 * @param obj - The object to check.
 * @returns True if the object is an Iterator or AsyncIterator, false otherwise.
 * @example
 * const iter = [1, 2, 3].values();
 * if (isIterator(iter)) {
 *   // ...
 * }
 */
export function isIterator<T>(obj: unknown): obj is Iterator<T> | AsyncIterator<T> {
  return isObject(obj) && hasPropertyFunction(obj, 'next');
}
