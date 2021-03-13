export function wrapToIterable<T>(it: Iterator<T>): Iterable<T> {
  return {
    [Symbol.iterator]() {
      return it;
    },
  };
}
