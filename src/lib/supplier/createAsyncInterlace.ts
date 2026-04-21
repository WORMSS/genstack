import type { AsyncInterlaceOptions } from '../types.ts';
import { getAsyncIterator } from '../utils/getAsyncIterator.ts';

/**
 * Creates an async generator that interlaces values from multiple async iterables or iterables.
 * It yields one value from each iterable in turn, skipping those that are exhausted, until all are exhausted.
 *
 * @param options - Multiple async iterables or iterables to interlace.
 * @returns An async generator yielding values from the provided iterables in an interlaced fashion.
 *
 * @example
 * ```typescript
 * const gen1 = [1, 2, 3];
 * const gen2 = (async function*() { yield 'a'; yield 'b'; })();
 * const interlaced = createAsyncInterlace(gen1, gen2);
 * // yields 1, 'a', 2, 'b', 3
 * ```
 */
export async function* createAsyncInterlace<T>(
  ...options: AsyncInterlaceOptions<T>
): AsyncGenerator<T, any, undefined> {
  const iterators = options.map((i) => getAsyncIterator(i));

  let length = iterators.length;
  while (length > 0) {
    for (let i = 0; i < length; ) {
      const result = await iterators[i]?.next();
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
