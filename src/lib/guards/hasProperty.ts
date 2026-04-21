/**
 * Checks if an object has a specific property.
 *
 * @param obj - The object to check.
 * @param prop - The property name to check for.
 * @returns True if the property exists in the object, false otherwise.
 * @example
 * const obj = { a: 1 };
 * if (hasProperty(obj, 'a')) {
 *   console.log(obj.a);
 * }
 */
export function hasProperty<T extends Record<keyof any, unknown>, P extends keyof any>(
  obj: T,
  prop: P,
): obj is T & Record<P, unknown> {
  return prop in obj;
}
