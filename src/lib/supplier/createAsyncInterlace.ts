import { AsyncInterlaceOptions } from '../types';
import { getAsyncIterator } from '../utils/getAsyncIterator';

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
