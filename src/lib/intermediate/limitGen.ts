export function* limitGen<T>(it: Iterator<T>, limit: number): Generator<T, any, undefined> {
  let i = 0;
  let result = it.next();
  while (!result.done && i++ < limit) {
    yield result.value;
    result = it.next();
  }
}
