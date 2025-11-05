import { hasPropertyFunction } from './hasPropertyFunction.ts';
import { isObject } from './isObject.ts';

export function isIterator<T>(obj: unknown): obj is Iterator<T> | AsyncIterator<T> {
  return isObject(obj) && hasPropertyFunction(obj, 'next');
}
