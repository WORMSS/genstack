export function reduce<T, U = T>(
  it: Iterator<T>,
  callbackFn: (previous: U, current: T) => U,
  initialValue?: U,
): U {
  let prev: U = initialValue === undefined ? it.next()?.value : initialValue;
  let currResult = it.next();

  while (!currResult.done) {
    prev = callbackFn(prev, currResult.value);
    currResult = it.next();
  }

  return prev;
}
