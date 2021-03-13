import { assertIterator } from '@/guards/assertIterator';
import { isAsyncIterable } from '@/guards/isAsyncIterable';
import { isIterable } from '@/guards/isIterable';
import { wrapToAsyncIterator } from '@/utils/wrapToAsyncIterator';

export function getAsyncIterator<T>(
  obj: Iterator<T> | Iterable<T> | AsyncIterator<T> | AsyncIterable<T>,
): AsyncIterator<T> {
  let iterator: Iterator<T> | AsyncIterator<T>;
  if (isAsyncIterable(obj)) {
    iterator = obj[Symbol.asyncIterator]();
  } else if (isIterable(obj)) {
    iterator = obj[Symbol.iterator]();
  } else {
    iterator = obj;
  }
  assertIterator(iterator);
  return wrapToAsyncIterator(iterator);
}
