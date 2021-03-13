export function* createGenerator<T>(generator: () => T): Generator<T> {
  while (true) {
    yield generator();
  }
}
