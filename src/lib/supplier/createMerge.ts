import type { MergeOptions } from '../types.ts';
import { getIterator } from '../utils/getIterator.ts';

/**
 * Creates a generator that merges multiple iterables.
 * It yields all values from the first iterable, then all from the second, and so on.
 *
 * @param options - Multiple iterables to merge.
 * @returns A generator yielding values from the provided iterables in sequence.
 *
 * @example
 * ```typescript
 * const gen1 = [1, 2];
 * const gen2 = ['a', 'b'];
 * const merged = createMerge(gen1, gen2);
 * // yields 1, 2, 'a', 'b'
 * ```
 */
export function* createMerge<T>(...options: MergeOptions<T>): Generator<T, any, undefined> {
  for (const opt of options) {
    const it = getIterator(opt);
    let result = it.next();
    while (!result.done) {
      yield result.value;
      result = it.next();
    }
  }
}
