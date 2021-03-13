import { isObject } from '@/guards/isObject';

export function isIterable<T>(obj: unknown): obj is Iterable<T> {
  return (
    typeof obj === 'string' ||
    (isObject(obj) && typeof (obj as any)[Symbol.iterator] === 'function')
  );
}
