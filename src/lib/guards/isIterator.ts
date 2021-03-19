import { hasProperty } from './hasProperty';
import { isObject } from './isObject';

export function isIterator<T>(obj: unknown): obj is Iterator<T> | AsyncIterator<T> {
  return isObject(obj) && hasProperty(obj, 'next') && typeof obj.next === 'function';
}
