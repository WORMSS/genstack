export async function* asyncPeekGen<T>(
  it: AsyncIterator<T>,
  callbackFn: (value: T) => void,
): AsyncGenerator<T, any, undefined> {
  let result = await it.next();
  while (!result.done) {
    try {
      callbackFn(result.value);
    } catch (e) {}
    yield result.value;
    result = await it.next();
  }
}
