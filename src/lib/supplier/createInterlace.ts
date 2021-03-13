import { getIterator } from '@/utils/getIterator';
import { InterlaceOptions } from '~types';

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
