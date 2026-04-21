import type { AsyncWalkerChildren } from '../types.ts';

/**
 * Creates an async generator that performs a depth-first traversal of a tree or graph structure.
 *
 * @param node - The starting node for the traversal.
 * @param childrenMapper - A function that returns the children of a given node (can be async).
 * @returns An async generator yielding nodes in depth-first order.
 *
 * @example
 * ```typescript
 * const root = { val: 1, children: [{ val: 2 }, { val: 3 }] };
 * const walker = createAsyncWalker(root, (node) => node.children);
 * for await (const node of walker) {
 *   console.log(node.val);
 * }
 * ```
 */
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
