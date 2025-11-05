import { AsyncGenStack } from '../../src/lib/AsyncGenStack.ts';
import { GenStack } from '../../src/lib/GenStack.ts';
import { expect, describe, it, vi } from 'vitest';

describe(GenStack.name, () => {
  describe('static', () => {
    describe(GenStack.from.name, () => {
      it('should create GenStack', () => {
        const gen = GenStack.from([]);
        expect(gen).toBeInstanceOf(GenStack);
      });
      it('should split a string', () => {
        const gen = GenStack.from('abcd');
        const result = gen.toArray();
        expect(result).toStrictEqual([...'abcd']);
      });
      it('should throw when given an invalid input', async () => {
        expect(() => GenStack.from(123 as any)).toThrow();
      });
    });

    describe(GenStack.generate.name, () => {
      it('should create GenStack', () => {
        const gen = GenStack.generate(() => null);
        expect(gen).toBeInstanceOf(GenStack);
      });

      it('should call generate function for each value', () => {
        const spy = vi.fn(incrementFn());
        const gen = GenStack.generate(spy);
        const result = popValues(gen, 5);

        expect(result).toStrictEqual([0, 1, 2, 3, 4]);
        expect(spy).toHaveBeenCalled();
        expect(spy).toBeCalledTimes(5);
      });

      it('should call generate function even with null', () => {
        const spy = vi.fn(() => null);
        const gen = GenStack.generate(spy);
        const result = popValues(gen, 3);

        expect(result).toStrictEqual([null, null, null]);
        expect(spy).toHaveBeenCalled();
        expect(spy).toBeCalledTimes(3);
      });

      it('should call generate function even with undefined', () => {
        const spy = vi.fn(() => void 0);
        const gen = GenStack.generate(spy);
        const result = popValues(gen, 3);

        expect(result).toStrictEqual([undefined, undefined, undefined]);
        expect(spy).toHaveBeenCalled();
        expect(spy).toBeCalledTimes(3);
      });
    });

    describe(GenStack.range.name, () => {
      it('should create GenStack', () => {
        const gen = GenStack.range();
        expect(gen).toBeInstanceOf(GenStack);
      });

      it('should result in incremental values by default', () => {
        const gen = GenStack.range();
        const result = popValues(gen, 5);
        expect(result).toStrictEqual([0, 1, 2, 3, 4]);
      });

      it('should result in incremental values by start 5', () => {
        const gen = GenStack.range({ start: 5 });
        const result = popValues(gen, 5);
        expect(result).toStrictEqual([5, 6, 7, 8, 9]);
      });

      it('should result in incremental values by end at 5', () => {
        const gen = GenStack.range({ end: 5 });
        const result = [...gen];
        expect(result).toStrictEqual([0, 1, 2, 3, 4]);
      });

      it('should result in incremental values in steps of 3', () => {
        const gen = GenStack.range({ step: 3 });
        const result = popValues(gen, 5);
        expect(result).toStrictEqual([0, 3, 6, 9, 12]);
      });

      it('should result in incremental values when start is less than 0', () => {
        const gen = GenStack.range({ start: -3 });
        const result = popValues(gen, 5);
        expect(result).toStrictEqual([-3, -2, -1, 0, 1]);
      });

      it('should result in decend values when step is less than 1', () => {
        const gen = GenStack.range({ step: -1 });
        const result = popValues(gen, 5);
        expect(result).toStrictEqual([0, -1, -2, -3, -4]);
      });

      it('should result in decend values when end is less than start', () => {
        const gen = GenStack.range({ start: 3, end: -3 });
        const result = [...gen];
        expect(result).toStrictEqual([3, 2, 1, 0, -1, -2]);
      });

      it('should result in decend values when end is less than start', () => {
        const gen = GenStack.range({ start: 3, end: -3 });
        const result = [...gen];
        expect(result).toStrictEqual([3, 2, 1, 0, -1, -2]);
      });

      it('should result in decend values when end is less than start and step is big', () => {
        const gen = GenStack.range({ start: 8, end: -8, step: 5 });
        const result = [...gen];
        expect(result).toStrictEqual([8, 3, -2, -7]);
      });

      it('should result in decend values when end is less than start and step is negative big', () => {
        const gen = GenStack.range({ start: 8, end: -8, step: -5 });
        const result = [...gen];
        expect(result).toStrictEqual([8, 3, -2, -7]);
      });
    });

    describe(GenStack.merge.name, () => {
      it('should create GenStack', () => {
        const gen = GenStack.merge();
        expect(gen).toBeInstanceOf(GenStack);
      });

      it('should interlace values', () => {
        const gen = GenStack.merge([], ['a', 'a', 'a'], [], ['b'], ['c', 'c']);
        const values = gen.toArray();
        expect(values).toStrictEqual(['a', 'a', 'a', 'b', 'c', 'c']);
      });
    });

    describe(GenStack.interlace.name, () => {
      it('should create GenStack', () => {
        const gen = GenStack.interlace();
        expect(gen).toBeInstanceOf(GenStack);
      });

      it('should interlace values', () => {
        const gen = GenStack.interlace([], ['a', 'a', 'a'], [], ['b'], ['c', 'c']);
        const values = gen.toArray();
        expect(values).toStrictEqual(['a', 'b', 'c', 'a', 'c', 'a']);
      });
    });

    describe(GenStack.walker.name, () => {
      it.skip('should ', () => {
        throw new Error();
      });
    });

    describe(GenStack.reg.name, () => {
      it.skip('should ', () => {
        throw new Error();
      });
    });
  });

  describe(GenStack.prototype.limit.name, () => {
    it('should limit an unlimited list to a set size items', () => {
      const gen = GenStack.from(incrementGen()).limit(5);
      const result = gen.toArray();
      expect(result).toStrictEqual([0, 1, 2, 3, 4]);
    });

    it('should limit a small list by a large limit', () => {
      const gen = GenStack.from([0, 1, 2, 3, 4]).limit(50);
      const result = gen.toArray();
      expect(result).toStrictEqual([0, 1, 2, 3, 4]);
    });
  });

  describe(GenStack.prototype.filter.name, () => {
    it('should filter unwanted items', () => {
      const spy = vi.fn((i: number) => i % 2 === 0);
      const gen = GenStack.from([0, 1, 2, 3, 4]).filter(spy);
      const result = gen.toArray();
      expect(result).toStrictEqual([0, 2, 4]);
      expect(spy).toHaveBeenCalled();
      expect(spy).toBeCalledTimes(5);
    });
  });

  describe(GenStack.prototype.map.name, () => {
    it('should map to different values', () => {
      const spy = vi.fn((i: number) => String.fromCharCode(i + 65));
      const gen = GenStack.from([0, 1, 2, 3, 4]).map(spy);
      const result = gen.toArray();
      expect(result).toStrictEqual(['A', 'B', 'C', 'D', 'E']);
      expect(spy).toHaveBeenCalled();
      expect(spy).toBeCalledTimes(5);
    });
  });

  describe(GenStack.prototype.distinct.name, () => {
    it('should return distint values', () => {
      const gen = GenStack.from([1, 1, 3, 2, 3, 0]).distinct();
      const result = gen.toArray();
      expect(result).toStrictEqual([1, 3, 2, 0]);
    });
  });

  describe(GenStack.prototype.flatMap.name, () => {
    it('should flatten the array', () => {
      const spy = vi.fn((i: string[]) => i);
      const gen = GenStack.from([['a', 'b'], ['c'], ['d', 'e']]).flatMap(spy);
      const result = gen.toArray();
      expect(result).toStrictEqual(['a', 'b', 'c', 'd', 'e']);
      expect(spy).toHaveBeenCalled();
      expect(spy).toBeCalledTimes(3);
    });
  });

  describe(GenStack.prototype.distinctBy.name, () => {
    it('should return distinc by values', () => {
      const spy = vi.fn((i: { a: string }) => i.a);
      const o = (a: string, b: number) => ({ a, b });
      const item1 = o('a', 1);
      const item2 = o('a', 2);
      const item3 = o('b', 3);
      const item4 = o('c', 4);
      const item5 = o('b', 5);
      const item6 = o('d', 6);

      const gen = GenStack.from([item1, item2, item3, item4, item5, item6]).distinctBy(spy);
      const result = gen.toArray();
      expect(result).toStrictEqual([item1, item3, item4, item6]);
      expect(spy).toHaveBeenCalled();
      expect(spy).toBeCalledTimes(6);
    });
  });

  describe(GenStack.prototype.peek.name, () => {
    it('should peek in the values', () => {
      const spy = vi.fn();
      const gen = GenStack.from([1, 2, 3, 4, 5, 6]).peek(spy);
      const result = gen.toArray();
      expect(result).toStrictEqual([1, 2, 3, 4, 5, 6]);
      expect(spy).toHaveBeenCalled();
      expect(spy).toBeCalledTimes(6);
    });
  });

  describe(GenStack.prototype.skip.name, () => {
    it('should skip the first few values', () => {
      const gen = GenStack.from([1, 2, 3, 4, 5, 6, 7, 8]).skip(3);
      const result = gen.toArray();
      expect(result).toStrictEqual([4, 5, 6, 7, 8]);
    });
  });

  describe(GenStack.prototype.skipWhile.name, () => {
    it('should skip while callback returns true', () => {
      const spy = vi.fn((i: number) => i !== 4);
      const gen = GenStack.from([1, 2, 3, 4, 5, 6, 7, 8]).skipWhile(spy);
      const result = gen.toArray();
      expect(result).toStrictEqual([4, 5, 6, 7, 8]);
      expect(spy).toHaveBeenCalled();
      expect(spy).toBeCalledTimes(4);
    });
  });

  describe(GenStack.prototype.skipUntil.name, () => {
    it('should skip while callback returns false', () => {
      const spy = vi.fn((i: number) => i === 4);
      const gen = GenStack.from([1, 2, 3, 4, 5, 6, 7, 8]).skipUntil(spy);
      const result = gen.toArray();
      expect(result).toStrictEqual([4, 5, 6, 7, 8]);
      expect(spy).toHaveBeenCalled();
      expect(spy).toBeCalledTimes(4);
    });
  });

  describe(GenStack.prototype.runWhile.name, () => {
    it('should run while callback returns true', () => {
      const spy = vi.fn((i: number) => i !== 4);
      const gen = GenStack.from([1, 2, 3, 4, 5, 6, 7, 8]).runWhile(spy);
      const result = gen.toArray();
      expect(result).toStrictEqual([1, 2, 3]);
      expect(spy).toHaveBeenCalled();
      expect(spy).toBeCalledTimes(4);
    });
  });

  describe(GenStack.prototype.runUntil.name, () => {
    it('should run while callback returns false', () => {
      const spy = vi.fn((i: number) => i === 4);
      const gen = GenStack.from([1, 2, 3, 4, 5, 6, 7, 8]).runUntil(spy);
      const result = gen.toArray();
      expect(result).toStrictEqual([1, 2, 3]);
      expect(spy).toHaveBeenCalled();
      expect(spy).toBeCalledTimes(4);
    });
  });

  describe(GenStack.prototype.merge.name, () => {
    it('should merge multiple iterators together', () => {
      const gen = GenStack.from('aaaa').merge('bbb', 'cc', 'd');
      const result = gen.toArray();
      expect(result).toStrictEqual([...'aaaabbbccd']);
    });
  });

  describe(GenStack.prototype.interlace.name, () => {
    it('should interlace with another iterator', () => {
      const gen = GenStack.from('aaaa').interlace(GenStack.from('bbbb'), GenStack.from('c'));
      const result = gen.toArray();
      expect(result).toStrictEqual([...'abcababab']);
    });
  });

  describe(GenStack.prototype.mapAsync.name, () => {
    it('should change to an AsyncGenStack', () => {
      const gen = GenStack.from([1]).mapAsync((i) => Promise.resolve(i));
      expect(gen).toBeInstanceOf(AsyncGenStack);
    });
  });

  describe(GenStack.prototype.reduce.name, () => {
    const accuulator = (prev: number, curr: number) => prev + curr;
    const emptyNumbers: number[] = [];
    it('should reduce to value', () => {
      const spy = vi.fn(accuulator);
      const gen = GenStack.from([1, 2]);
      const result = gen.reduce(spy);

      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toHaveBeenCalledWith(1, 2);
      expect(result).toBe(3);
    });
    it('should return undefined with no value', () => {
      const spy = vi.fn(accuulator);
      const gen = GenStack.from(emptyNumbers);
      const result = gen.reduce(spy);

      expect(spy).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
    it('should return the first value if only 1', () => {
      const spy = vi.fn(accuulator);
      const gen = GenStack.from([1]);
      const result = gen.reduce(spy);

      expect(spy).not.toHaveBeenCalled();
      expect(result).toBe(1);
    });
    it('should return the transformed value when initial value is given', () => {
      const spy = vi.fn((p: string, c: number) => p + String(c));
      const gen = GenStack.from([1]);
      const result = gen.reduce(spy, '');

      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toBeCalledWith('', 1);
      expect(result).toBe('1');
    });
    it('should return the initial value when no values', () => {
      const spy = vi.fn((p: string, c: number) => p + String(c));
      const gen = GenStack.from(emptyNumbers);
      const result = gen.reduce(spy, 'goat');

      expect(spy).not.toHaveBeenCalled();
      expect(result).toBe('goat');
    });
  });
});

function* incrementGen(): Generator<number, any, unknown> {
  let a = 0;
  while (true) {
    yield a++;
  }
}

function incrementFn(): () => number {
  let a = 0;
  return () => a++;
}

function popValues<T>(gen: GenStack<T>, size: number): T[] {
  const values: T[] = [];
  for (let i = 0; i < size; i++) {
    values.push(gen.next().value);
  }
  return values;
}
