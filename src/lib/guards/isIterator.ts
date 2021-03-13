import { hasProperty } from '@/guards/hasProperty';
import { isObject } from '@/guards/isObject';

export function isIterator<T>(obj: unknown): obj is Iterator<T> | AsyncIterator<T> {
  return isObject(obj) && hasProperty(obj, 'next') && typeof obj.next === 'function';
}
