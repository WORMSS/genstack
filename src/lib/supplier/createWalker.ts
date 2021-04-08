import { WalkerChildren } from '../types';

export function createWalker<T>(
  node: T,
  childrenMapper: WalkerChildren<T>,
): Generator<T, any, undefined> {
  return walker(node, childrenMapper, new Set());
}

function* walker<T>(
  node: T,
  children: WalkerChildren<T>,
  visited: Set<T>,
): Generator<T, any, undefined> {
  if (visited.has(node)) {
    return;
  }
  visited.add(node);
  yield node;
  const childrenNodes = children(node);
  if (childrenNodes !== null && childrenNodes !== undefined) {
    for (const child of childrenNodes) {
      yield* walker(child, children, visited);
    }
  }
}
