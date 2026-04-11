import { AsyncGenStack } from '../../src/lib/AsyncGenStack.ts';
import { expect, describe, it, vi } from 'vitest';

describe(AsyncGenStack.name, () => {
  describe('static', () => {
    describe(AsyncGenStack.from.name, () => {
      it('should create AsyncGenStack', () => {
        const gen = AsyncGenStack.from([]);
        expect(gen).toBeInstanceOf(AsyncGenStack);
      });
      it('should split a string', async () => {
        const gen = AsyncGenStack.from('abcd');
        const result = await gen.toArray();
        expect(result).toStrictEqual([...'abcd']);
      });
    });

    describe(AsyncGenStack.range.name, () => {
      it('should create AsyncGenStack', () => {
        const gen = AsyncGenStack.range();
        expect(gen).toBeInstanceOf(AsyncGenStack);
      });

      it('should result in incremental values by default', async () => {
        const gen = AsyncGenStack.range();
        const result = await popValues(gen, 5);
        expect(result).toStrictEqual([0, 1, 2, 3, 4]);
      });

      it('should result in incremental values by start 5', async () => {
        const gen = AsyncGenStack.range({ start: 5 });
        const result = await popValues(gen, 5);
        expect(result).toStrictEqual([5, 6, 7, 8, 9]);
      });

      it('should result in incremental values by end at 5', async () => {
        const gen = AsyncGenStack.range({ end: 5 });
        const result = [...(await gen.toArray())];
        expect(result).toStrictEqual([0, 1, 2, 3, 4]);
      });

      it('should result in incremental values in steps of 3', async () => {
        const gen = AsyncGenStack.range({ step: 3 });
        const result = await popValues(gen, 5);
        expect(result).toStrictEqual([0, 3, 6, 9, 12]);
      });

      it('should result in incremental values when start is less than 0', async () => {
        const gen = AsyncGenStack.range({ start: -3 });
        const result = await popValues(gen, 5);
        expect(result).toStrictEqual([-3, -2, -1, 0, 1]);
      });

      it('should result in decend values when step is less than 1', async () => {
        const gen = AsyncGenStack.range({ step: -1 });
        const result = await popValues(gen, 5);
        expect(result).toStrictEqual([0, -1, -2, -3, -4]);
      });

      it('should result in decend values when end is less than start', async () => {
        const gen = AsyncGenStack.range({ start: 3, end: -3 });
        const result = [...(await gen.toArray())];
        expect(result).toStrictEqual([3, 2, 1, 0, -1, -2]);
      });

      it('should result in decend values when end is less than start', async () => {
        const gen = AsyncGenStack.range({ start: 3, end: -3 });
        const result = [...(await gen.toArray())];
        expect(result).toStrictEqual([3, 2, 1, 0, -1, -2]);
      });

      it('should result in decend values when end is less than start and step is big', async () => {
        const gen = AsyncGenStack.range({ start: 8, end: -8, step: 5 });
        const result = [...(await gen.toArray())];
        expect(result).toStrictEqual([8, 3, -2, -7]);
      });

      it('should result in decend values when end is less than start and step is negative big', async () => {
        const gen = AsyncGenStack.range({ start: 8, end: -8, step: -5 });
        const result = [...(await gen.toArray())];
        expect(result).toStrictEqual([8, 3, -2, -7]);
      });
    });

    describe(AsyncGenStack.interlace.name, () => {
      it('should create AsyncGenStack', () => {
        const gen = AsyncGenStack.interlace();
        expect(gen).toBeInstanceOf(AsyncGenStack);
      });

      it('should interlace values', async () => {
        const gen = AsyncGenStack.interlace([], ['a', 'a', 'a'], [], ['b'], ['c', 'c']);
        const values = await gen.toArray();
        expect(values).toStrictEqual(['a', 'b', 'c', 'a', 'c', 'a']);
      });
    });

    describe(AsyncGenStack.walker.name, () => {
      it('should traverse a tree depth-first', async () => {
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
        const gen = AsyncGenStack.walker(tree, (n) => n.children);
        const result = await gen.map((n) => n.id).toArray();
        expect(result).toStrictEqual(['root', 'child1', 'grandchild1', 'child2']);
      });

      it('should handle circular references', async () => {
        interface Node {
          id: string;
          children?: Node[];
        }
        const node1: Node = { id: 'node1' };
        const node2: Node = { id: 'node2', children: [node1] };
        node1.children = [node2];

        const gen = AsyncGenStack.walker(node1, (n) => n.children);
        const result = await gen.map((n) => n.id).toArray();
        expect(result).toStrictEqual(['node1', 'node2']);
      });

      it('should handle empty or null children', async () => {
        const gen = AsyncGenStack.walker({ id: 1 }, (n: any) => n.children);
        const result = await gen.toArray();
        expect(result).toStrictEqual([{ id: 1 }]);
      });
    });

    describe(AsyncGenStack.reg.name, () => {
      it('should yield regex matches', async () => {
        const gen = AsyncGenStack.reg('a.', 'aaabacad');
        const result = await gen.map((m) => m[0]).toArray();
        expect(result).toStrictEqual(['aa', 'ab', 'ac', 'ad']);
      });

      it('should add global flag if missing', async () => {
        const gen = AsyncGenStack.reg(/a./, 'aaabacad');
        const result = await gen.map((m) => m[0]).toArray();
        expect(result).toStrictEqual(['aa', 'ab', 'ac', 'ad']);
      });

      it('should preserve lastIndex', async () => {
        const reg = /a./g;
        reg.lastIndex = 3;
        const gen = AsyncGenStack.reg(reg, 'aaabacad');
        const result = await gen.map((m) => m[0]).toArray();
        expect(result).toStrictEqual(['ac', 'ad']);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty input for chainable methods', async () => {
      const gen = AsyncGenStack.from([]);
      expect(await gen.map((i) => i).toArray()).toStrictEqual([]);
      expect(await gen.filter((i) => true).toArray()).toStrictEqual([]);
      expect(await gen.flatMap((i) => [i]).toArray()).toStrictEqual([]);
      expect(await gen.distinct().toArray()).toStrictEqual([]);
      expect(await gen.skip(5).toArray()).toStrictEqual([]);
      expect(await gen.limit(5).toArray()).toStrictEqual([]);
    });

    it('should handle infinite ranges with limit', async () => {
      const gen = AsyncGenStack.range().limit(3);
      expect(await gen.toArray()).toStrictEqual([0, 1, 2]);
    });
  });

  describe(AsyncGenStack.prototype.limit.name, () => {
    it('should limit an unlimited list to a set size items', async () => {
      const gen = AsyncGenStack.from(incrementGen()).limit(5);
      const result = await gen.toArray();
      expect(result).toStrictEqual([0, 1, 2, 3, 4]);
    });

    it('should limit a small list by a large limit', async () => {
      const gen = AsyncGenStack.from([0, 1, 2, 3, 4]).limit(50);
      const result = await gen.toArray();
      expect(result).toStrictEqual([0, 1, 2, 3, 4]);
    });
  });

  describe(AsyncGenStack.prototype.filter.name, () => {
    it('should filter unwanted items', async () => {
      const spy = vi.fn((i: number) => i % 2 === 0);
      const gen = AsyncGenStack.from([0, 1, 2, 3, 4]).filter(spy);
      const result = await gen.toArray();
      expect(result).toStrictEqual([0, 2, 4]);
      expect(spy).toHaveBeenCalled();
      expect(spy).toBeCalledTimes(5);
    });
    it('should filter unwanted items async', async () => {
      const spy = vi.fn((i: number) => Promise.resolve(i % 2 === 0));
      const gen = AsyncGenStack.from([0, 1, 2, 3, 4]).filter(spy);
      const result = await gen.toArray();
      expect(result).toStrictEqual([0, 2, 4]);
      expect(spy).toHaveBeenCalled();
      expect(spy).toBeCalledTimes(5);
    });
  });

  describe(AsyncGenStack.prototype.filterNull.name, () => {
    it('should filter null items', async () => {
      const gen = AsyncGenStack.from([0, null, 1, null, 2]).filterNull();
      const result = await gen.toArray();
      expect(result).toStrictEqual([0, 1, 2]);
    });
  });

  describe(AsyncGenStack.prototype.filterUndefined.name, () => {
    it('should filter undefined items', async () => {
      const gen = AsyncGenStack.from([0, undefined, 1, undefined, 2]).filterUndefined();
      const result = await gen.toArray();
      expect(result).toStrictEqual([0, 1, 2]);
    });
  });

  describe(AsyncGenStack.prototype.filterNullUndefined.name, () => {
    it('should filter null and undefined items', async () => {
      const gen = AsyncGenStack.from([0, null, 1, undefined, 2]).filterNullUndefined();
      const result = await gen.toArray();
      expect(result).toStrictEqual([0, 1, 2]);
    });
  });

  describe(AsyncGenStack.prototype.map.name, () => {
    it('should map to different values', async () => {
      const spy = vi.fn((i: number) => String.fromCharCode(i + 65));
      const gen = AsyncGenStack.from([0, 1, 2, 3, 4]).map(spy);
      const result = await gen.toArray();
      expect(result).toStrictEqual(['A', 'B', 'C', 'D', 'E']);
      expect(spy).toHaveBeenCalled();
      expect(spy).toBeCalledTimes(5);
    });
  });

  describe(AsyncGenStack.prototype.distinct.name, () => {
    it('should return distint values', async () => {
      const gen = AsyncGenStack.from([1, 1, 3, 2, 3, 0]).distinct();
      const result = await gen.toArray();
      expect(result).toStrictEqual([1, 3, 2, 0]);
    });
  });

  describe(AsyncGenStack.prototype.flatMap.name, () => {
    it('should flatten the array', async () => {
      const spy = vi.fn((i: string[]) => i);
      const gen = AsyncGenStack.from([['a', 'b'], ['c'], ['d', 'e']]).flatMap(spy);
      const result = await gen.toArray();
      expect(result).toStrictEqual(['a', 'b', 'c', 'd', 'e']);
      expect(spy).toHaveBeenCalled();
      expect(spy).toBeCalledTimes(3);
    });
  });

  describe(AsyncGenStack.prototype.distinctBy.name, () => {
    it('should return distinc by values', async () => {
      const spy = vi.fn((i: { a: string }) => i.a);
      const o = (a: string, b: number) => ({ a, b });
      const item1 = o('a', 1);
      const item2 = o('a', 2);
      const item3 = o('b', 3);
      const item4 = o('c', 4);
      const item5 = o('b', 5);
      const item6 = o('d', 6);

      const gen = AsyncGenStack.from([item1, item2, item3, item4, item5, item6]).distinctBy(spy);
      const result = await gen.toArray();
      expect(result).toStrictEqual([item1, item3, item4, item6]);
      expect(spy).toHaveBeenCalled();
      expect(spy).toBeCalledTimes(6);
    });
  });

  describe(AsyncGenStack.prototype.peek.name, () => {
    it('should peek in the values', async () => {
      const spy = vi.fn();
      const gen = AsyncGenStack.from([1, 2, 3, 4, 5, 6]).peek(spy);
      const result = await gen.toArray();
      expect(result).toStrictEqual([1, 2, 3, 4, 5, 6]);
      expect(spy).toHaveBeenCalled();
      expect(spy).toBeCalledTimes(6);
    });
  });

  describe(AsyncGenStack.prototype.skip.name, () => {
    it('should skip the first few values', async () => {
      const gen = AsyncGenStack.from([1, 2, 3, 4, 5, 6, 7, 8]).skip(3);
      const result = await gen.toArray();
      expect(result).toStrictEqual([4, 5, 6, 7, 8]);
    });
  });

  describe(AsyncGenStack.prototype.skipWhile.name, () => {
    it('should skip while callback returns true', async () => {
      const spy = vi.fn((i) => i !== 4);
      const gen = AsyncGenStack.from([1, 2, 3, 4, 5, 6, 7, 8]).skipWhile(spy);
      const result = await gen.toArray();
      expect(result).toStrictEqual([4, 5, 6, 7, 8]);
      expect(spy).toHaveBeenCalled();
      expect(spy).toBeCalledTimes(4);
    });
  });

  describe(AsyncGenStack.prototype.skipUntil.name, () => {
    it('should skip while callback returns false', async () => {
      const spy = vi.fn((i) => i === 4);
      const gen = AsyncGenStack.from([1, 2, 3, 4, 5, 6, 7, 8]).skipUntil(spy);
      const result = await gen.toArray();
      expect(result).toStrictEqual([4, 5, 6, 7, 8]);
      expect(spy).toHaveBeenCalled();
      expect(spy).toBeCalledTimes(4);
    });
  });

  describe(AsyncGenStack.prototype.runWhile.name, () => {
    it('should run while callback returns true', async () => {
      const spy = vi.fn((i) => i !== 4);
      const gen = AsyncGenStack.from([1, 2, 3, 4, 5, 6, 7, 8]).runWhile(spy);
      const result = await gen.toArray();
      expect(result).toStrictEqual([1, 2, 3]);
      expect(spy).toHaveBeenCalled();
      expect(spy).toBeCalledTimes(4);
    });
  });

  describe(AsyncGenStack.prototype.runUntil.name, () => {
    it('should run while callback returns false', async () => {
      const spy = vi.fn((i) => i === 4);
      const gen = AsyncGenStack.from([1, 2, 3, 4, 5, 6, 7, 8]).runUntil(spy);
      const result = await gen.toArray();
      expect(result).toStrictEqual([1, 2, 3]);
      expect(spy).toHaveBeenCalled();
      expect(spy).toBeCalledTimes(4);
    });
  });

  describe(AsyncGenStack.prototype.merge.name, () => {
    it('should merge multiple iterators together', async () => {
      const gen = AsyncGenStack.from('aaaa').merge('bbb', 'cc', 'd');
      const result = await gen.toArray();
      expect(result).toStrictEqual([...'aaaabbbccd']);
    });
  });

  describe(AsyncGenStack.prototype.interlace.name, () => {
    it('should interlace with another iterator', async () => {
      const gen = AsyncGenStack.from('aaaa').interlace(
        AsyncGenStack.from('bbbb'),
        AsyncGenStack.from('c'),
      );
      const result = await gen.toArray();
      expect(result).toStrictEqual([...'abcababab']);
    });
  });

  describe(AsyncGenStack.prototype.walker.name, () => {
    it('should traverse recursively for each item', async () => {
      interface Node {
        id: string;
        children?: Node[];
      }
      const tree1: Node = { id: 'a', children: [{ id: 'a1' }] };
      const tree2: Node = { id: 'b', children: [{ id: 'b1' }] };

      const gen = AsyncGenStack.from([tree1, tree2]).walker((n) => n.children);
      const result = await gen.map((n) => n.id).toArray();
      expect(result).toStrictEqual(['a', 'a1', 'b', 'b1']);
    });
  });

  describe(AsyncGenStack.prototype.reduce.name, () => {
    const accuulator = (prev: number, curr: number) => prev + curr;
    const emptyNumbers: number[] = [];
    it('should reduce to value', async () => {
      const spy = vi.fn(accuulator);
      const gen = AsyncGenStack.from([1, 2]);
      const result = await gen.reduce(spy);

      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toHaveBeenCalledWith(1, 2);
      expect(result).toBe(3);
    });
    it('should return undefined with no value', async () => {
      const spy = vi.fn(accuulator);
      const gen = AsyncGenStack.from(emptyNumbers);
      const result = await gen.reduce(spy);

      expect(spy).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
    it('should return the first value if only 1', async () => {
      const spy = vi.fn(accuulator);
      const gen = AsyncGenStack.from([1]);
      const result = await gen.reduce(spy);

      expect(spy).not.toHaveBeenCalled();
      expect(result).toBe(1);
    });
    it('should return the transformed value when initial value is given', async () => {
      const spy = vi.fn((p: string, c: number) => p + String(c));
      const gen = AsyncGenStack.from([1]);
      const result = await gen.reduce(spy, '');

      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toBeCalledWith('', 1);
      expect(result).toBe('1');
    });
    it('should return the initial value when no values', async () => {
      const spy = vi.fn((p: string, c: number) => p + String(c));
      const gen = AsyncGenStack.from(emptyNumbers);
      const result = await gen.reduce(spy, 'goat');

      expect(spy).not.toHaveBeenCalled();
      expect(result).toBe('goat');
    });
  });

  describe(AsyncGenStack.prototype.some.name, () => {
    it('should return true if any item matches', async () => {
      const gen = AsyncGenStack.range().limit(10);
      const result = await gen.some((n) => n === 5);
      expect(result).toBe(true);
    });

    it('should return false if no item matches', async () => {
      const gen = AsyncGenStack.from([1, 2, 3]);
      const result = await gen.some((n) => n === 5);
      expect(result).toBe(false);
    });

    it('should short-circuit', async () => {
      const spy = vi.fn((n: number) => n === 2);
      const gen = AsyncGenStack.from([0, 1, 2, 3, 4]);
      const result = await gen.some(spy);
      expect(result).toBe(true);
      expect(spy).toHaveBeenCalledTimes(3);
    });
  });

  describe(AsyncGenStack.prototype.toMap.name, () => {
    it('should create a map with default mappers', async () => {
      const gen = AsyncGenStack.from(['a', 'b']);
      const result = await gen.toMap();
      expect(result).toBeInstanceOf(Map);
      expect(result.get('a')).toBe('a');
      expect(result.get('b')).toBe('b');
    });

    it('should use custom key and value mappers', async () => {
      const gen = AsyncGenStack.from([
        { id: 'a', val: 1 },
        { id: 'b', val: 2 },
      ]);
      const result = await gen.toMap(
        (i) => i.id,
        (i) => i.val,
      );
      expect(result.get('a')).toBe(1);
      expect(result.get('b')).toBe(2);
    });

    it('should use options object', async () => {
      const gen = AsyncGenStack.from([{ id: 'a', val: 1 }]);
      const result = await gen.toMap({ key: (i) => i.id, value: (i) => i.val });
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

async function popValues<T>(gen: AsyncGenStack<T>, size: number): Promise<T[]> {
  const values: T[] = [];
  for (let i = 0; i < size; i++) {
    values.push((await gen.next()).value);
  }
  return values;
}
