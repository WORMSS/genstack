import { isObject } from './isObject';

export function isIterable<T>(obj: unknown): obj is Iterable<T> {
  return typeof obj === 'string' || (isObject(obj) && typeof obj[Symbol.iterator] === 'function');
}
