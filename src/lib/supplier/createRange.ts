import type { RangeOptions } from '../types.ts';

/**
 * Creates a generator that yields a range of numbers.
 *
 * @param options - Configuration for the range (start, end, step).
 * @returns A generator yielding numbers in the specified range.
 *
 * @example
 * ```typescript
 * // Yields 0, 1, 2, 3, 4
 * const range = createRange({ start: 0, end: 5, step: 1 });
 *
 * // Yields 0, 1, 2, ... (infinite)
 * const infiniteRange = createRange({ start: 0 });
 * ```
 */
export function createRange(options?: RangeOptions): Generator<number, any, undefined> {
  let start: number | undefined;
  let end: number | undefined;
  let step: number | undefined;
  start = options?.start ?? 0;
  if (!Number.isFinite(start)) {
    throw new RangeError('start not a finite number');
  }

  step = options?.step ?? 1;
  if (!Number.isFinite(step)) {
    throw new RangeError('step not a finite number');
  }
  if (step === 0) {
    throw new RangeError('step cannot be zero');
  }

  end = options?.end;
  if (end === undefined) {
    return createRangeInfinity(start, step);
  }
  if (!Number.isFinite(end)) {
    throw new RangeError('end is not finite number');
  }

  step ??= 1;
  if (!Number.isFinite(step)) {
    throw new RangeError('step not a finite number');
  }
  if (step === 0) {
    throw new RangeError('step cannot be zero');
  }

  step = Math.abs(step);
  if (start < end) {
    return createRangeFiniteAscend(start, end, step);
  }
  return createRangeFiniteDescend(start, end, step);
}

function* createRangeInfinity(start: number, step: number) {
  while (true) {
    yield start;
    start += step;
  }
}
function* createRangeFiniteDescend(start: number, end: number, step: number) {
  for (; start > end; start -= step) {
    yield start;
  }
}
function* createRangeFiniteAscend(start: number, end: number, step: number) {
  for (; start < end; start += step) {
    yield start;
  }
}
