import { hasPropertyFunction } from './hasPropertyFunction';
import { isObject } from './isObject';

export function isAsyncIterable<T>(obj: unknown): obj is AsyncIterable<T> {
  return isObject(obj) && hasPropertyFunction(obj, Symbol.asyncIterator);
}
