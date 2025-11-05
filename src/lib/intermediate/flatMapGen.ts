import type { FlatMapCallback } from '../types.ts';
import { getIterator } from '../utils/getIterator.ts';
import { wrapToIterable } from '../utils/wrapToIterable.ts';

export function* flatMapGen<T, U>(
  it: Iterator<T>,
  callbackFn: FlatMapCallback<T, U>,
): Generator<U, any, undefined> {
  let results = it.next();
  while (!results.done) {
    yield* wrapToIterable(getIterator(callbackFn(results.value)));
    results = it.next();
  }
}
