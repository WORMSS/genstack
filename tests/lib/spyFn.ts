interface SpyFn {
  (...args: any[]): any;
  readonly hasRun: boolean;
  readonly runCount: number;
}

export function spyFn(orig?: (...args: any[]) => any): SpyFn {
  let hasRun = false;
  let runCount = 0;
  const fn = (...args: any[]): any => {
    hasRun = true;
    runCount++;
    return orig?.(...args);
  };
  return Object.defineProperties(fn, {
    hasRun: {
      get: () => hasRun,
    },
    runCount: {
      get: () => runCount,
    },
  });
}
