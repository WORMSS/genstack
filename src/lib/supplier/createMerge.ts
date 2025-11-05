import type { MergeOptions } from '../types.ts';
import { getIterator } from '../utils/getIterator.ts';

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
