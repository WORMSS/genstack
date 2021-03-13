export async function* asyncLimitGen<T>(
  input: Iterator<T> | AsyncIterator<T>,
  limit: number,
): AsyncGenerator<T, any, undefined> {
  let i = 0;
  let result = await input.next();
  while (!result.done && i++ < limit) {
    yield result.value;
    result = await input.next();
  }
}
