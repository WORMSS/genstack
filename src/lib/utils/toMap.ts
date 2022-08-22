import { ToMapOptions } from '../types';

export function toMap<T, K = T, V = T>(
  it: Iterator<T>,
  keyOrOptions?: ToMapOptions<T, K, V> | ((i: T) => K),
  value?: (i: T) => V,
): Map<K, V> {
  let keyMaker: (i: T) => K;
  let valueMaker: (i: T) => V;
  if (typeof keyOrOptions === 'object') {
    keyMaker = keyOrOptions.key ?? ((i) => i as unknown as K);
    valueMaker = keyOrOptions.value ?? ((i) => i as unknown as V);
  } else {
    keyMaker = keyOrOptions ?? ((i) => i as unknown as K);
    valueMaker = value ?? ((i) => i as unknown as V);
  }
  const map: Map<K, V> = new Map();
  let result = it.next();
  while (!result.done) {
    map.set(keyMaker(result.value), valueMaker(result.value));
    result = it.next();
  }
  return map;
}

toMap([''][Symbol.iterator](), Math.random, Math.random);
