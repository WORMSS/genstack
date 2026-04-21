import type { WalkerChildren } from '../types.ts';

/**
 * Creates a generator that performs a depth-first traversal of a tree or graph structure.
 *
 * @param node - The starting node for the traversal.
 * @param childrenMapper - A function that returns the children of a given node.
 * @returns A generator yielding nodes in depth-first order.
 *
 * @example
 * ```typescript
 * const root = { val: 1, children: [{ val: 2 }, { val: 3 }] };
 * const walker = createWalker(root, (node) => node.children);
 * for (const node of walker) {
 *   console.log(node.val);
 * }
 * ```
 */
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
