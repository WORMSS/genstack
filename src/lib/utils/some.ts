export function some<T>(it: Iterator<T>, cb: (value: T, index: number) => unknown): boolean {
  let index = 0;
  let result = it.next();

  while (!result.done) {
    if (!!cb(result.value, index++)) {
      return true;
    }
    result = it.next();
  }

  return false;
}
