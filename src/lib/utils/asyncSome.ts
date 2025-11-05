export async function asyncSome<T>(
  it: AsyncIterator<T>,
  cb: (item: T, index: number) => unknown | PromiseLike<unknown>,
): Promise<boolean> {
  let index = 0;
  let result = await it.next();

  while (!result.done) {
    if (!!(await cb(result.value, index++))) {
      return true;
    }
    result = await it.next();
  }

  return false;
}
