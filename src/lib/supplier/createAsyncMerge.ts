import { AsyncMergeOptions } from '../types';
import { getAsyncIterator } from '../utils/getAsyncIterator';

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
