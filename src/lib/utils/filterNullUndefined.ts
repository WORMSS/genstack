export function filterNullUndefined<T>(n: T): n is Exclude<T, null | undefined> {
  return n !== null && n !== undefined;
}
