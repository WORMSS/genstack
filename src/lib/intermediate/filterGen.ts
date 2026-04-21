import type { Predicate } from '../types.ts';

/**
 * Creates a generator that yields values from the input iterator that satisfy the predicate.
 *
 * @param it - The source iterator.
 * @param predicate - A function to test each value.
 * @returns A generator that yields filtered values.
 * @example
 * ```ts
 * const it = [1, 2, 3, 4].values();
 * const filtered = filterGen(it, (x) => x % 2 === 0);
 * for (const val of filtered) {
 *   console.log(val); // 2, 4
 * }
 * ```
 */
export function filterGen<T, S extends T>(
  it: Iterator<T>,
  predicate: Predicate<T, S>,
): Generator<S, any, undefined>;
export function filterGen<T, S extends T>(
  it: Iterator<T>,
  predicate: (n: T) => unknown,
): Generator<T, any, undefined>;
export function* filterGen<T>(
  it: Iterator<T>,
  predicate: (n: T) => unknown,
): Generator<T, any, undefined> {
  let result = it.next();
  while (!result.done) {
    const value = result.value;
    if (predicate(value)) {
      yield value;
    }
    result = it.next();
  }
}
