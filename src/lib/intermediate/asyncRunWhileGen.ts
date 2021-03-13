export async function* asyncRunWhileGen<T>(
  it: AsyncIterator<T>,
  callbackFn: (value: T) => boolean,
): AsyncGenerator<T, any, undefined> {
  let result = await it.next();
  while (!result.done && callbackFn(result.value)) {
    yield result.value;
    result = await it.next();
  }
}
