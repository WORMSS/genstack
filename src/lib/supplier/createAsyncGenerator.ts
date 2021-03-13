export async function* createAsyncGenerator<T>(
  generator: () => PromiseLike<T> | T,
): AsyncGenerator<T> {
  while (true) {
    yield generator();
  }
}
