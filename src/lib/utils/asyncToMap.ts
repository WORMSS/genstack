import { AsyncToMapOptions } from '../types';

export async function asyncToMap<T, K = T, V = T>(
  it: AsyncIterator<T>,
  keyOrOptions?: AsyncToMapOptions<T, K, V> | ((i: T) => K | PromiseLike<K>),
  value?: (i: T) => V | PromiseLike<V>,
): Promise<Map<K, V>> {
  let keyMaker: (i: T) => K | PromiseLike<K>;
  let valueMaker: (i: T) => V | PromiseLike<V>;
  if (typeof keyOrOptions === 'object') {
    keyMaker = keyOrOptions.key ?? ((i) => i as unknown as K);
    valueMaker = keyOrOptions.value ?? ((i) => i as unknown as V);
  } else {
    keyMaker = keyOrOptions ?? ((i) => i as unknown as K);
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
