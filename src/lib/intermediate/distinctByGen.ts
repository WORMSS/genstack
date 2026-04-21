import type { DisinctCallback } from '../types.ts';

/**
 * Creates a generator that yields unique values from the input iterator based on a custom key selector.
 *
 * @param it - The source iterator.
 * @param callbackFn - A function that returns a key for each value to determine uniqueness.
 * @returns A generator that yields distinct values.
 * @example
 * ```ts
 * const it = [{ id: 1 }, { id: 2 }, { id: 1 }].values();
 * const distinct = distinctByGen(it, (x) => x.id);
 * for (const val of distinct) {
 *   console.log(val); // { id: 1 }, { id: 2 }
 * }
 * ```
 */
export function* distinctByGen<T, U>(
  it: Iterator<T>,
  callbackFn: DisinctCallback<T, U>,
): Generator<T, any, undefined> {
  const set = new Set<U>();
  let result = it.next();
  while (!result.done) {
    const value = result.value;
    const convert = callbackFn(value);
    const exists = set.has(convert);
    set.add(convert);
    if (!exists) {
      yield value;
    }
    result = it.next();
  }
}
