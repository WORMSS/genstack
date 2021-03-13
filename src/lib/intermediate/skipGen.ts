export function* skipGen<T>(it: Iterator<T>, skip: number): Generator<T, any, undefined> {
  let i = 0;
  let result = it.next();
  while (!result.done && i++ < skip) {
    result = it.next();
  }
  while (!result.done) {
    yield result.value;
    result = it.next();
  }
}
