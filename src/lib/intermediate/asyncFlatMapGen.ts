import type { AsyncFlatMapCallback } from '../types.ts';
import { getAsyncIterator } from '../utils/getAsyncIterator.ts';
import { wrapToAsyncIterable } from '../utils/wrapToAsyncIterable.ts';

/**
 * Creates an async generator that maps each value to an iterator and flattens the result.
 *
 * @param input - The source iterator or async iterator.
 * @param callbackFn - A function that returns an iterator for each value.
 * @returns An async generator that yields flattened values.
 * @example
 * ```ts
 * const it = [1, 2].values();
 * const flattened = asyncFlatMapGen(it, (x) => [x, x * 10].values());
 * for await (const val of flattened) {
 *   console.log(val); // 1, 10, 2, 20
 * }
 * ```
 */
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
