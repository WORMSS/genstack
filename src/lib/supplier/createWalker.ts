import { WalkerChildren } from '../types';

export function createWalker<T>(
  node: T,
  childrenMapper: WalkerChildren<T>,
): Generator<T, any, undefined> {
  if (node === null || node === undefined) {
    throw new TypeError('expected node to not be null');
  }
  if (!(typeof childrenMapper === 'function')) {
    throw new TypeError('expected childrenMapper to be a function');
  }
  return walker(node, childrenMapper, new Set());
}

function* walker<T>(
  node: T,
  childrenMapper: WalkerChildren<T>,
  visited: Set<T>,
): Generator<T, any, undefined> {
  if (visited.has(node)) {
    return;
  }
  visited.add(node);
  yield node;
  const children = childrenMapper(node);
  if (children !== null && children !== undefined) {
    for (const child of children) {
      yield* walker(child, childrenMapper, visited);
    }
  }
}
