export function wrapToAsyncIterator<T, TReturn = any, TNext = undefined>(
  obj: Iterator<T, TReturn, TNext> | AsyncIterator<T, TReturn, TNext>,
): AsyncIterator<T, TReturn, TNext> {
  const wrap: AsyncIterator<T, TReturn, TNext> = {
    async next(...args: any) {
      return obj.next(...args);
    },
  };
  if ('return' in obj) {
    wrap.return =
      typeof obj.return === 'function' ? async (value) => obj.return!(await value) : obj.return;
  }
  if ('throw' in obj) {
    wrap.throw =
      typeof obj.throw === 'function' ? (err) => Promise.resolve(obj.throw!(err)) : obj.throw;
  }
  return wrap;
}
