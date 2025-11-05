import { assertIterator } from '../guards/assertIterator.ts';
import { isIterable } from '../guards/isIterable.ts';

export function getIterator<T>(obj: Iterator<T> | Iterable<T>): Iterator<T> {
  let it: Iterator<T>;
  if (isIterable(obj)) {
    it = obj[Symbol.iterator]();
  } else {
    it = obj;
  }
  assertIterator(it);
  return it;
}
