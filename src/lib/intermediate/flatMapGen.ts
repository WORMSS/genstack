import type { FlatMapCallback } from '../types.ts';
import { getIterator } from '../utils/getIterator.ts';
import { wrapToIterable } from '../utils/wrapToIterable.ts';

/**
 * Creates a generator that maps each value to an iterator and flattens the result.
 *
 * @param it - The source iterator.
 * @param callbackFn - A function that returns an iterator for each value.
 * @returns A generator that yields flattened values.
 * @example
 * ```ts
 * const it = [1, 2].values();
 * const flattened = flatMapGen(it, (x) => [x, x * 10].values());
 * for (const val of flattened) {
 *   console.log(val); // 1, 10, 2, 20
 * }
 * ```
 */
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
