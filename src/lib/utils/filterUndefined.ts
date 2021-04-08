export function filterUndefined<T>(n: T): n is Exclude<T, undefined> {
  return n !== undefined;
}
