export function hasProperty<T extends Record<keyof any, unknown>, P extends keyof any>(
  obj: T,
  prop: P,
): obj is T & Record<P, unknown> {
  return prop in obj;
}
