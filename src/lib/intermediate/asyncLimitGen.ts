export async function* asyncLimitGen<T>(
  input: Iterator<T> | AsyncIterator<T>,
  limit: number,
): AsyncGenerator<T, any, undefined> {
  let i = 0;
  while (i++ < limit) {
    let result = await input.next();
    if (result.done) {
      return;
    }
    yield result.value;
  }
}
