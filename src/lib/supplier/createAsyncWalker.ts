import { AsyncWalkerChildren } from '../types';

export function createAsyncWalker<T>(
  node: T,
  childrenMapper: AsyncWalkerChildren<T>,
): AsyncGenerator<T, any, undefined> {
  return walker(node, childrenMapper, new Set());
}

async function* walker<T>(
  node: T,
  children: AsyncWalkerChildren<T>,
  visited: Set<T>,
): AsyncGenerator<T, any, undefined> {
  if (visited.has(node)) {
    return;
  }
  visited.add(node);
  yield node;
  const childrenNodes = children(node);
  if (childrenNodes !== null && childrenNodes !== undefined) {
    for await (const child of childrenNodes) {
      yield* walker(child, children, visited);
    }
  }
}
