import { AsyncDisinctCallback } from '../types';

export async function* asyncDistinctByGen<T, U>(
  it: AsyncIterator<T>,
  callbackFn: AsyncDisinctCallback<T, U>,
): AsyncGenerator<T, any, undefined> {
  const set = new Set<U>();
  let result = await it.next();
  while (!result.done) {
    const value = result.value;
    const convert = await callbackFn(value);
    const exists = set.has(convert);
    set.add(convert);
    if (!exists) {
      yield value;
    }
    result = await it.next();
  }
}
