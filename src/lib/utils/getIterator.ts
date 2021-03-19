import { assertIterator } from '../guards/assertIterator';
import { isIterable } from '../guards/isIterable';

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
