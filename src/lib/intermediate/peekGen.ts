export function* peekGen<T>(
  it: Iterator<T>,
  callbackFn: (value: T) => void,
): Generator<T, any, undefined> {
  let result = it.next();
  while (!result.done) {
    try {
      callbackFn(result.value);
    } catch (e) {}
    yield result.value;
    result = it.next();
  }
}
