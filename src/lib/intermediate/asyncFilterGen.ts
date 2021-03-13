export async function* asyncFilterGen<T>(
  input: Iterator<T> | AsyncIterator<T>,
  predicate: (value: T) => boolean | PromiseLike<boolean>,
): AsyncGenerator<T, any, undefined> {
  let result = await input.next();
  while (!result.done) {
    const value = result.value;
    if (await predicate(value)) {
      yield value;
    }
    result = await input.next();
  }
}
