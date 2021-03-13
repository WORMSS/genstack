export function isObject(obj: unknown): obj is Record<keyof any, unknown> {
  return typeof obj === 'object' && !!obj;
}
