export function* distinctGen<T>(it: Iterator<T>): Generator<T, any, undefined> {
  const set = new Set<T>();
  let result = it.next();
  while (!result.done) {
    const value = result.value;
    const exists = set.has(value);
    set.add(value);
    if (exists) {
      yield value;
    }
    result = it.next();
  }
}
