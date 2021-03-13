export function isAsyncIterable<T>(obj: unknown): obj is AsyncIterable<T> {
  return (
    typeof obj === 'object' && !!obj && typeof (obj as any)[Symbol.asyncIterator] === 'function'
  );
}
