export function wrapToAsyncIterator<T, TReturn = any, TNext = undefined>(
  obj: Iterator<T, TReturn, TNext> | AsyncIterator<T, TReturn, TNext>,
): AsyncIterator<T, TReturn, TNext> {
  const wrap: AsyncIterator<T, TReturn, TNext> = {
    async next(...args: any) {
      return obj.next(...args);
    },
  };
  const { return: return2, throw: throw2 } = obj;
  if (return2) {
    wrap.return = async (value: any) => return2(value);
  }
  if (throw2) {
    wrap.throw = async (e?: any) => throw2(e);
  }
  return wrap;
}
