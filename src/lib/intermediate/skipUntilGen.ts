export function* skipUntilGen<T>(
  it: Iterator<T>,
  callbackFn: (value: T) => boolean,
): Generator<T, any, undefined> {
  let result = it.next();
  while (!result.done && !callbackFn(result.value)) {
    result = it.next();
  }
  while (!result.done) {
    yield result.value;
    result = it.next();
  }
}
