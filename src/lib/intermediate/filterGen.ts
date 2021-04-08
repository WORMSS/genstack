import { Predicate } from '../types';

export function filterGen<T, S extends T>(
  it: Iterator<T>,
  predicate: Predicate<T, S>,
): Generator<S, any, undefined>;
export function filterGen<T, S extends T>(
  it: Iterator<T>,
  predicate: (n: T) => unknown,
): Generator<T, any, undefined>;
export function* filterGen<T>(
  it: Iterator<T>,
  predicate: (n: T) => unknown,
): Generator<T, any, undefined> {
  let result = it.next();
  while (!result.done) {
    const value = result.value;
    if (predicate(value)) {
      yield value;
    }
    result = it.next();
  }
}
