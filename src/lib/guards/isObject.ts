export function isObject(
  obj: unknown,
): obj is Record<keyof any, unknown> & {
  [Symbol.iterator]?: unknown;
  [Symbol.asyncIterator]?: unknown;
} {
  return typeof obj === 'object' && !!obj;
}
