import { getIterator } from '@/utils/getIterator';
import { wrapToIterable } from '@/utils/wrapToIterable';
import { FlatMapCallback } from '~types';

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
