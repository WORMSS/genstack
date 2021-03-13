export function* mapGen<T, U>(
  it: Iterator<T>,
  callbackfn: (value: T) => U,
): Generator<U, any, undefined> {
  let result = it.next();
  while (!result.done) {
    yield callbackfn(result.value);
    result = it.next();
  }
}
