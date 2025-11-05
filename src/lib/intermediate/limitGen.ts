export function* limitGen<T>(it: Iterator<T>, limit: number): Generator<T, any, undefined> {
  let i = 0;

  let result: IteratorResult<T, any>;
  while (i++ < limit) {
    result = it.next();
    if (result.done) {
      return;
    }
    yield result.value;
  }
}
