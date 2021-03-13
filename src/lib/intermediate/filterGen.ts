export function* filterGen<T>(
  it: Iterator<T>,
  predicate: (value: T) => boolean,
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
