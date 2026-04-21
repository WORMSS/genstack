import type { AsyncToMapOptions } from '../types.ts';

/**
 * Converts an async iterator into a Map.
 *
 * @param it - The async iterator to convert.
 * @param keyOrOptions - Key maker function or options object.
 * @param value - Value maker function.
 * @returns A promise that resolves to a Map.
 * @example
 * ```ts
 * const it = (async function*() { yield { id: 1, val: 'a' }; })();
 * const map = await asyncToMap(it, { key: (x) => x.id, value: (x) => x.val });
 * ```
 */
export function asyncToMap<T>(it: AsyncIterator<T>): Promise<Map<T, T>>;
export function asyncToMap<T, K, V>(
  it: AsyncIterator<T>,
  options: AsyncToMapOptions<T, K, V>,
): Promise<Map<K, V>>;
export function asyncToMap<T, K, V>(
  it: AsyncIterator<T>,
  key?: ((i: T) => K | PromiseLike<K>) | null,
  value?: (i: T) => V | PromiseLike<V>,
): Promise<Map<K, V>>;
export async function asyncToMap<T, K = T, V = T>(
  it: AsyncIterator<T>,
  keyOrOptions?: AsyncToMapOptions<T, K, V> | ((i: T) => K | PromiseLike<K>) | null,
  value?: (i: T) => V | PromiseLike<V>,
): Promise<Map<K, V>> {
  let keyMaker: (i: T) => K | PromiseLike<K>;
  let valueMaker: (i: T) => V | PromiseLike<V>;

  if ((keyOrOptions === undefined || keyOrOptions === null) && value === undefined) {
    keyMaker = (i) => i as unknown as K;
    valueMaker = (i) => i as unknown as V;
  } else if (typeof keyOrOptions === 'object' && keyOrOptions !== null) {
    keyMaker = keyOrOptions.key ?? ((i) => i as unknown as K);
    valueMaker = keyOrOptions.value ?? ((i) => i as unknown as V);
  } else {
    keyMaker = (keyOrOptions as (i: T) => K) ?? ((i) => i as unknown as K);
    valueMaker = value ?? ((i) => i as unknown as V);
  }

  const map: Map<K, V> = new Map();
  let result = await it.next();
  while (!result.done) {
    const kp = keyMaker(result.value);
    const vp = valueMaker(result.value);
    map.set(await kp, await vp);
    result = await it.next();
  }
  return map;
}
