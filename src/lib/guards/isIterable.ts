import { hasPropertyFunction } from './hasPropertyFunction.ts';
import { isObject } from './isObject.ts';

/**
 * Checks if an object is an Iterable.
 * Strings are considered iterables.
 *
 * @param obj - The object to check.
 * @returns True if the object is an Iterable, false otherwise.
 * @example
 * if (isIterable([1, 2, 3])) {
 *   // ...
 * }
 * if (isIterable('hello')) {
 *   // ...
 * }
 */
export function isIterable<T>(obj: unknown): obj is Iterable<T> {
  return typeof obj === 'string' || (isObject(obj) && hasPropertyFunction(obj, Symbol.iterator));
}
