export async function asyncReduce<T, U = T>(
  it: AsyncIterator<T>,
  callbackFn: (previous: U, current: T) => U | PromiseLike<U>,
  initialValue?: U,
): Promise<U> {
  let prev: U = initialValue === undefined ? (await it.next())?.value : initialValue;
  let currResult = await it.next();

  while (!currResult.done) {
    prev = await callbackFn(prev, currResult.value);
    currResult = await it.next();
  }

  return prev;
}
