export async function* asyncSkipGen<T>(
  input: Iterator<T> | AsyncIterator<T>,
  skip: number,
): AsyncGenerator<T, any, undefined> {
  let it = await input.next();
  let i = 0;
  while (!it.done && i++ < skip) {
    it = await input.next();
  }
  while (!it.done) {
    yield it.value;
    it = await input.next();
  }
}
