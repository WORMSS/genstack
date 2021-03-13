export async function* asyncMapGen<T, U>(
  input: Iterator<T> | AsyncIterator<T>,
  callbackfn: (value: T) => U | PromiseLike<U>,
): AsyncGenerator<U, any, undefined> {
  let result = await input.next();
  while (!result.done) {
    yield callbackfn(result.value);
    result = await input.next();
  }
}
