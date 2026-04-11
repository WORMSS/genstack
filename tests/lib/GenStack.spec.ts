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
      it('should traverse a tree depth-first', () => {
        interface Node {
          id: string;
          children?: Node[];
        }
        const tree: Node = {
          id: 'root',
          children: [
            { id: 'child1', children: [{ id: 'grandchild1' }] },
            { id: 'child2' },
          ],
        };
        const gen = GenStack.walker(tree, (n) => n.children);
        const result = gen.map((n) => n.id).toArray();
        expect(result).toStrictEqual(['root', 'child1', 'grandchild1', 'child2']);
      });

      it('should handle circular references', () => {
        interface Node {
          id: string;
          children?: Node[];
        }
        const node1: Node = { id: 'node1' };
        const node2: Node = { id: 'node2', children: [node1] };
        node1.children = [node2];

        const gen = GenStack.walker(node1, (n) => n.children);
        const result = gen.map((n) => n.id).toArray();
        expect(result).toStrictEqual(['node1', 'node2']);
      });

      it('should handle empty or null children', () => {
        const gen = GenStack.walker({ id: 1 }, (n: any) => n.children);
        const result = gen.toArray();
        expect(result).toStrictEqual([{ id: 1 }]);
      });
    });

    describe(GenStack.reg.name, () => {
      it('should yield regex matches', () => {
        const gen = GenStack.reg('a.', 'aaabacad');
        const result = gen.map((m) => m[0]).toArray();
        expect(result).toStrictEqual(['aa', 'ab', 'ac', 'ad']);
      });

      it('should add global flag if missing', () => {
        const gen = GenStack.reg(/a./, 'aaabacad');
        const result = gen.map((m) => m[0]).toArray();
        expect(result).toStrictEqual(['aa', 'ab', 'ac', 'ad']);
      });

      it('should preserve lastIndex', () => {
        const reg = /a./g;
        reg.lastIndex = 3;
        const gen = GenStack.reg(reg, 'aaabacad');
        const result = gen.map((m) => m[0]).toArray();
        // Index 3 is 'b', so next match is 'ba' at index 3? 
        // Wait, 'aaabacad'
        // Index: 01234567
        // Char : aaabacad
        // reg /a./g starting at index 3:
        // index 4: 'ac'
        // index 6: 'ad'
        expect(result).toStrictEqual(['ac', 'ad']);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty input for chainable methods', () => {
      const gen = GenStack.from([]);
      expect(gen.map((i) => i).toArray()).toStrictEqual([]);
      expect(gen.filter((i) => true).toArray()).toStrictEqual([]);
      expect(gen.flatMap((i) => [i]).toArray()).toStrictEqual([]);
      expect(gen.distinct().toArray()).toStrictEqual([]);
      expect(gen.skip(5).toArray()).toStrictEqual([]);
      expect(gen.limit(5).toArray()).toStrictEqual([]);
    });

    it('should handle infinite ranges with limit', () => {
      const gen = GenStack.range().limit(3);
      expect(gen.toArray()).toStrictEqual([0, 1, 2]);
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

    it('should handle truthy/falsy return values', () => {
      const gen = GenStack.from([0, 1, '', 'a', null, {}, undefined]);
      // filter only truthy
      const result = gen.filter((i: any) => i).toArray();
      expect(result).toStrictEqual([1, 'a', {}]);
    });
  });

  describe(GenStack.prototype.filterNull.name, () => {
    it('should filter null items', () => {
      const gen = GenStack.from([0, null, 1, null, 2]).filterNull();
      const result = gen.toArray();
      expect(result).toStrictEqual([0, 1, 2]);
    });
  });

  describe(GenStack.prototype.filterUndefined.name, () => {
    it('should filter undefined items', () => {
      const gen = GenStack.from([0, undefined, 1, undefined, 2]).filterUndefined();
      const result = gen.toArray();
      expect(result).toStrictEqual([0, 1, 2]);
    });
  });

  describe(GenStack.prototype.filterNullUndefined.name, () => {
    it('should filter null and undefined items', () => {
      const gen = GenStack.from([0, null, 1, undefined, 2]).filterNullUndefined();
      const result = gen.toArray();
      expect(result).toStrictEqual([0, 1, 2]);
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
      expect(gen.constructor.name).toBe('AsyncGenStack');
    });
  });

  describe(GenStack.prototype.walker.name, () => {
    it('should traverse recursively for each item', () => {
      interface Node {
        id: string;
        children?: Node[];
      }
      const tree1: Node = { id: 'a', children: [{ id: 'a1' }] };
      const tree2: Node = { id: 'b', children: [{ id: 'b1' }] };

      const gen = GenStack.from([tree1, tree2]).walker((n) => n.children);
      const result = gen.map((n) => n.id).toArray();
      expect(result).toStrictEqual(['a', 'a1', 'b', 'b1']);
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

  describe(GenStack.prototype.some.name, () => {
    it('should return true if any item matches', () => {
      const gen = GenStack.range().limit(10);
      const result = gen.some((n) => n === 5);
      expect(result).toBe(true);
    });

    it('should return false if no item matches', () => {
      const gen = GenStack.from([1, 2, 3]);
      const result = gen.some((n) => n === 5);
      expect(result).toBe(false);
    });

    it('should short-circuit', () => {
      const spy = vi.fn((n: number) => n === 2);
      const gen = GenStack.from([0, 1, 2, 3, 4]);
      const result = gen.some(spy);
      expect(result).toBe(true);
      expect(spy).toHaveBeenCalledTimes(3);
    });

    it('should handle truthy/falsy return values', () => {
      expect(GenStack.from([0, 0, 1]).some((i: any) => i)).toBe(true);
      expect(GenStack.from([0, '', null]).some((i: any) => i)).toBe(false);
    });
  });

  describe(GenStack.prototype.toMap.name, () => {
    it('should create a map with default mappers', () => {
      const gen = GenStack.from(['a', 'b']);
      const result = gen.toMap();
      expect(result).toBeInstanceOf(Map);
      expect(result.get('a')).toBe('a');
      expect(result.get('b')).toBe('b');
    });

    it('should use custom key and value mappers', () => {
      const gen = GenStack.from([
        { id: 'a', val: 1 },
        { id: 'b', val: 2 },
      ]);
      const result = gen.toMap(
        (i) => i.id,
        (i) => i.val,
      );
      expect(result.get('a')).toBe(1);
      expect(result.get('b')).toBe(2);
    });

    it('should use options object', () => {
      const gen = GenStack.from([{ id: 'a', val: 1 }]);
      const result = gen.toMap({ key: (i) => i.id, value: (i) => i.val });
      expect(result.get('a')).toBe(1);
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
