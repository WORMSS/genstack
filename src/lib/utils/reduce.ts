export function reduce<T, U = T>(
  it: Iterator<T>,
  cb: (previous: U, current: T) => U,
  initialValue?: U,
): U {
  let prev: U = initialValue === undefined ? it.next()?.value : initialValue;
  let currResult = it.next();

  while (!currResult.done) {
    prev = cb(prev, currResult.value);
    currResult = it.next();
  }

  return prev;
}
