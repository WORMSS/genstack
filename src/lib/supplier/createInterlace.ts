import type { InterlaceOptions } from '../types.ts';
import { getIterator } from '../utils/getIterator.ts';

/**
 * Creates a generator that interlaces values from multiple iterables.
 * It yields one value from each iterable in turn, skipping those that are exhausted, until all are exhausted.
 *
 * @param options - Multiple iterables to interlace.
 * @returns A generator yielding values from the provided iterables in an interlaced fashion.
 *
 * @example
 * ```typescript
 * const gen1 = [1, 2, 3];
 * const gen2 = ['a', 'b'];
 * const interlaced = createInterlace(gen1, gen2);
 * // yields 1, 'a', 2, 'b', 3
 * ```
 */
export function* createInterlace<T>(...options: InterlaceOptions<T>): Generator<T, any, undefined> {
  const iterators = options.map((i) => getIterator(i));

  let length = iterators.length;
  while (length > 0) {
    for (let i = 0; i < length; ) {
      const result = iterators[i]?.next();
      if (!result || result.done) {
        iterators.splice(i, 1);
        length = iterators.length;
        // do not increment i
        continue;
      }
      yield result.value;
      i++;
    }
  }
}
