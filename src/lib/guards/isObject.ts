/**
 * Checks if a value is a non-null object.
 *
 * @param obj - The value to check.
 * @returns True if the value is a non-null object, false otherwise.
 * @example
 * if (isObject({})) {
 *   // ...
 * }
 * if (!isObject(null)) {
 *   // ...
 * }
 */
export function isObject(obj: unknown): obj is Record<keyof any, unknown> {
  return typeof obj === 'object' && !!obj;
}
