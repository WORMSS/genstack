export function wrapToAsyncIterable<T>(it: AsyncIterator<T>): AsyncIterable<T> {
  return {
    [Symbol.asyncIterator]() {
      return it;
    },
  };
}
