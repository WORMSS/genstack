import { hasProperty } from './hasProperty.ts';

/**
 * Checks if an object has a specific property and that property is a function.
 *
 * @param obj - The object to check.
 * @param prop - The property name to check for.
 * @returns True if the property exists and is a function, false otherwise.
 * @example
 * const obj = { sayHello: () => 'hello' };
 * if (hasPropertyFunction(obj, 'sayHello')) {
 *   obj.sayHello();
 * }
 */
export function hasPropertyFunction<T extends Record<keyof any, unknown>, P extends keyof any>(
  obj: T,
  prop: P,
): obj is T & Record<P, Function> {
  return hasProperty(obj, prop) && typeof obj[prop] === 'function';
}
