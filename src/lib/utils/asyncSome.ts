export async function asyncSome<T>(
  it: AsyncIterator<T>,
  predicate: (item: T, index: number) => unknown | PromiseLike<unknown>,
): Promise<boolean> {
  let index = 0;
  let result = await it.next();

  while (!result.done) {
    if (!!(await predicate(result.value, index++))) {
      return true;
    }
    result = await it.next();
  }

  return false;
}
