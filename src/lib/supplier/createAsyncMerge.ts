import type { AsyncMergeOptions } from '../types.ts';
import { getAsyncIterator } from '../utils/getAsyncIterator.ts';

/**
 * Creates an async generator that merges multiple async iterables or iterables.
 * It yields all values from the first iterable, then all from the second, and so on.
 *
 * @param options - Multiple async iterables or iterables to merge.
 * @returns An async generator yielding values from the provided iterables in sequence.
 *
 * @example
 * ```typescript
 * const gen1 = [1, 2];
 * const gen2 = (async function*() { yield 'a'; yield 'b'; })();
 * const merged = createAsyncMerge(gen1, gen2);
 * // yields 1, 2, 'a', 'b'
 * ```
 */
export async function* createAsyncMerge<T>(
  ...options: AsyncMergeOptions<T>
): AsyncGenerator<T, any, undefined> {
  for (const opt of options) {
    const it = getAsyncIterator(opt);
    let result = await it.next();
    while (!result.done) {
      yield result.value;
      result = await it.next();
    }
  }
}
