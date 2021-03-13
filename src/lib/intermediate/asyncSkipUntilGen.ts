export async function* asyncSkipUntilGen<T>(
  it: AsyncIterator<T>,
  callbackFn: (value: T) => boolean,
): AsyncGenerator<T, any, undefined> {
  let result = await it.next();
  while (!result.done && !callbackFn(result.value)) {
    result = await it.next();
  }
  while (!result.done) {
    yield result.value;
    result = await it.next();
  }
}
