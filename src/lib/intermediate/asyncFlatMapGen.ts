import type { AsyncFlatMapCallback } from '../types.ts';
import { getAsyncIterator } from '../utils/getAsyncIterator.ts';
import { wrapToAsyncIterable } from '../utils/wrapToAsyncIterable.ts';

export async function* asyncFlatMapGen<T, U>(
  input: Iterator<T> | AsyncIterator<T>,
  callbackFn: AsyncFlatMapCallback<T, U>,
): AsyncGenerator<U, any, undefined> {
  const it = getAsyncIterator(input);
  let result = await it.next();
  while (!result.done) {
    yield* wrapToAsyncIterable(getAsyncIterator(callbackFn(result.value)));
    result = await it.next();
  }
}
