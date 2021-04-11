import { isIterator } from './isIterator';

export function assertIterator<T>(obj: unknown): asserts obj is Iterator<T> {
  if (!isIterator(obj)) {
    throw new TypeError(`${String(obj)} is not an Iterator`);
  }
}
