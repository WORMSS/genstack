import { hasPropertyFunction } from './hasPropertyFunction';
import { isObject } from './isObject';

export function isIterable<T>(obj: unknown): obj is Iterable<T> {
  return typeof obj === 'string' || (isObject(obj) && hasPropertyFunction(obj, Symbol.iterator));
}
