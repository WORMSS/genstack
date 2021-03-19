import { DisinctCallback } from '../types';

export function* distinctByGen<T, U>(
  it: Iterator<T>,
  callbackFn: DisinctCallback<T, U>,
): Generator<T, any, undefined> {
  const set = new Set<U>();
  let result = it.next();
  while (!result.done) {
    const value = result.value;
    const convert = callbackFn(value);
    const exists = set.has(convert);
    set.add(convert);
    if (!exists) {
      yield value;
    }
    result = it.next();
  }
}
