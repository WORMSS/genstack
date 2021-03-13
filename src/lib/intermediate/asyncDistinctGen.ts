export async function* asyncDistinctGen<T>(
  it: AsyncIterator<T>,
): AsyncGenerator<T, any, undefined> {
  const set = new Set<T>();
  let result = await it.next();
  while (!result.done) {
    const value = result.value;
    const exists = set.has(value);
    set.add(value);
    if (exists) {
      yield value;
    }
    result = await it.next();
  }
}
