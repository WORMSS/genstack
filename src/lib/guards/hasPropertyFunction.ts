import { hasProperty } from './hasProperty';

export function hasPropertyFunction<T extends Record<keyof any, unknown>, P extends keyof any>(
  obj: T,
  prop: P,
): obj is T & Record<P, Function> {
  return hasProperty(obj, prop) && typeof obj[prop] === 'function';
}
