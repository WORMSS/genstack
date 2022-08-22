import { hasPropertyFunction } from './hasPropertyFunction';
import { isObject } from './isObject';

export function isIterator<T>(obj: unknown): obj is Iterator<T> | AsyncIterator<T> {
  return isObject(obj) && hasPropertyFunction(obj, 'next');
}
