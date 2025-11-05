import { hasPropertyFunction } from './hasPropertyFunction.ts';
import { isObject } from './isObject.ts';

export function isIterable<T>(obj: unknown): obj is Iterable<T> {
  return typeof obj === 'string' || (isObject(obj) && hasPropertyFunction(obj, Symbol.iterator));
}
