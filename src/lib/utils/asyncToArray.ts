export async function asyncToArray<T>(it: AsyncIterator<T>): Promise<T[]> {
  const values = [];
  let result = await it.next();
  while (!result.done) {
    values.push(result.value);
    result = await it.next();
  }
  return values;
}
