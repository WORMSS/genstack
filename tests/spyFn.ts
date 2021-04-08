interface SpyFn {
  (...args: any[]): any;
  readonly called: boolean;
  readonly callCount: number;
}

export function spyFn(orig?: (...args: any[]) => any): SpyFn {
  let called = false;
  let callCount = 0;
  const fn = (...args: any[]): any => {
    called = true;
    callCount++;
    return orig?.(...args);
  };
  return Object.defineProperties(fn, {
    called: {
      get: () => called,
    },
    callCount: {
      get: () => callCount,
    },
  });
}
