export function filterNull<T>(n: T): n is Exclude<T, null> {
  return n !== null;
}
