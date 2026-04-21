import type { AsyncDisinctCallback } from '../types.ts';

/**
 * Creates an async generator that yields unique values from the input iterator based on a custom key selector.
 *
 * @param it - The source async iterator.
 * @param callbackFn - A function that returns a key for each value to determine uniqueness.
 * @returns An async generator that yields distinct values.
 * @example
 * ```ts
 * const it = (async function*() { yield { id: 1 }; yield { id: 2 }; yield { id: 1 }; })();
 * const distinct = asyncDistinctByGen(it, (x) => x.id);
 * for await (const val of distinct) {
 *   console.log(val); // { id: 1 }, { id: 2 }
 * }
 * ```
 */
export async function* asyncDistinctByGen<T, U>(
  it: AsyncIterator<T>,
  callbackFn: AsyncDisinctCallback<T, U>,
): AsyncGenerator<T, any, undefined> {
  const set = new Set<U>();
  let result = await it.next();
  while (!result.done) {
    const value = result.value;
    const convert = await callbackFn(value);
    const exists = set.has(convert);
    set.add(convert);
    if (!exists) {
      yield value;
    }
    result = await it.next();
  }
}
