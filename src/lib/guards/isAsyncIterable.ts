import { isObject } from './isObject';

export function isAsyncIterable<T>(obj: unknown): obj is AsyncIterable<T> {
  return isObject(obj) && typeof obj[Symbol.asyncIterator] === 'function';
}
