import { hasPropertyFunction } from './hasPropertyFunction.ts';
import { isObject } from './isObject.ts';

export function isAsyncIterable<T>(obj: unknown): obj is AsyncIterable<T> {
  return isObject(obj) && hasPropertyFunction(obj, Symbol.asyncIterator);
}
