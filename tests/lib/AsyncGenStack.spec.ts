import { assert } from 'chai';
import { AsyncGenStack } from '../../src/lib/AsyncGenStack';
import { spyFn } from '../spyFn';

describe(AsyncGenStack.name, () => {
  describe(`${AsyncGenStack.name}.${AsyncGenStack.from.name}`, () => {
    it('should create AsyncGenStack', () => {
      const gen = AsyncGenStack.from([]);
      assert.instanceOf(gen, AsyncGenStack);
    });
    it('should split a string', async () => {
      const gen = AsyncGenStack.from('abcd');
      const result = await gen.toArray();
      assert.deepEqual(result, [...'abcd']);
    });
  });

  describe(`${AsyncGenStack.name}.${AsyncGenStack.range.name}`, () => {
    it('should create AsyncGenStack', () => {
      const gen = AsyncGenStack.range();
      assert.instanceOf(gen, AsyncGenStack);
    });

    it('should result in incremental values by default', async () => {
      const gen = AsyncGenStack.range();
      const result = await popValues(gen, 5);
      assert.deepEqual(result, [0, 1, 2, 3, 4]);
    });

    it('should result in incremental values by start 5', async () => {
      const gen = AsyncGenStack.range({ start: 5 });
      const result = await popValues(gen, 5);
      assert.deepEqual(result, [5, 6, 7, 8, 9]);
    });

    it('should result in incremental values by end at 5', async () => {
      const gen = AsyncGenStack.range({ end: 5 });
      const result = [...(await gen.toArray())];
      assert.deepEqual(result, [0, 1, 2, 3, 4]);
    });

    it('should result in incremental values in steps of 3', async () => {
      const gen = AsyncGenStack.range({ step: 3 });
      const result = await popValues(gen, 5);
      assert.deepEqual(result, [0, 3, 6, 9, 12]);
    });

    it('should result in incremental values when start is less than 0', async () => {
      const gen = AsyncGenStack.range({ start: -3 });
      const result = await popValues(gen, 5);
      assert.deepEqual(result, [-3, -2, -1, 0, 1]);
    });

    it('should result in decend values when step is less than 1', async () => {
      const gen = AsyncGenStack.range({ step: -1 });
      const result = await popValues(gen, 5);
      assert.deepEqual(result, [0, -1, -2, -3, -4]);
    });

    it('should result in decend values when end is less than start', async () => {
      const gen = AsyncGenStack.range({ start: 3, end: -3 });
      const result = [...(await gen.toArray())];
      assert.deepEqual(result, [3, 2, 1, 0, -1, -2]);
    });

    it('should result in decend values when end is less than start', async () => {
      const gen = AsyncGenStack.range({ start: 3, end: -3 });
      const result = [...(await gen.toArray())];
      assert.deepEqual(result, [3, 2, 1, 0, -1, -2]);
    });

    it('should result in decend values when end is less than start and step is big', async () => {
      const gen = AsyncGenStack.range({ start: 8, end: -8, step: 5 });
      const result = [...(await gen.toArray())];
      assert.deepEqual(result, [8, 3, -2, -7]);
    });

    it('should result in decend values when end is less than start and step is negative big', async () => {
      const gen = AsyncGenStack.range({ start: 8, end: -8, step: -5 });
      const result = [...(await gen.toArray())];
      assert.deepEqual(result, [8, 3, -2, -7]);
    });
  });

  describe(`${AsyncGenStack.name}.${AsyncGenStack.interlace.name}`, () => {
    it('should create AsyncGenStack', () => {
      const gen = AsyncGenStack.interlace();
      assert.instanceOf(gen, AsyncGenStack);
    });

    it('should interlace values', async () => {
      const gen = AsyncGenStack.interlace([], ['a', 'a', 'a'], [], ['b'], ['c', 'c']);
      const values = await gen.toArray();
      assert.deepEqual(values, ['a', 'b', 'c', 'a', 'c', 'a']);
    });
  });

  describe(AsyncGenStack.prototype.limit.name, () => {
    it('should limit an unlimited list to a set size items', async () => {
      const gen = AsyncGenStack.from(incrementGen()).limit(5);
      const result = await gen.toArray();
      assert.deepEqual(result, [0, 1, 2, 3, 4]);
    });

    it('should limit a small list by a large limit', async () => {
      const gen = AsyncGenStack.from([0, 1, 2, 3, 4]).limit(50);
      const result = await gen.toArray();
      assert.deepEqual(result, [0, 1, 2, 3, 4]);
    });
  });

  describe(AsyncGenStack.prototype.filter.name, () => {
    it('should filter unwanted items', async () => {
      const spy = spyFn((i) => i % 2 === 0);
      const gen = AsyncGenStack.from([0, 1, 2, 3, 4]).filter(spy);
      const result = await gen.toArray();
      assert.deepEqual(result, [0, 2, 4]);
      assert.isTrue(spy.called);
      assert.equal(spy.callCount, 5);
    });
    it('should filter unwanted items async', async () => {
      const spy = spyFn((i) => Promise.resolve(i % 2 === 0));
      const gen = AsyncGenStack.from([0, 1, 2, 3, 4]).filter(spy);
      const result = await gen.toArray();
      assert.deepEqual(result, [0, 2, 4]);
      assert.isTrue(spy.called);
      assert.equal(spy.callCount, 5);
    });
  });

  describe(AsyncGenStack.prototype.map.name, () => {
    it('should map to different values', async () => {
      const spy = spyFn((i) => String.fromCharCode(i + 65));
      const gen = AsyncGenStack.from([0, 1, 2, 3, 4]).map(spy);
      const result = await gen.toArray();
      assert.deepEqual(result, ['A', 'B', 'C', 'D', 'E']);
      assert.isTrue(spy.called);
      assert.equal(spy.callCount, 5);
    });
  });

  describe(AsyncGenStack.prototype.distinct.name, () => {
    it('should return distint values', async () => {
      const gen = AsyncGenStack.from([1, 1, 3, 2, 3, 0]).distinct();
      const result = await gen.toArray();
      assert.deepEqual(result, [1, 3, 2, 0]);
    });
  });

  describe(AsyncGenStack.prototype.flatMap.name, () => {
    it('should flatten the array', async () => {
      const spy = spyFn((i) => i);
      const gen = AsyncGenStack.from([['a', 'b'], ['c'], ['d', 'e']]).flatMap(spy);
      const result = await gen.toArray();
      assert.deepEqual(result, ['a', 'b', 'c', 'd', 'e']);
      assert.isTrue(spy.called);
      assert.equal(spy.callCount, 3);
    });
  });

  describe(AsyncGenStack.prototype.distinctBy.name, () => {
    it('should return distinc by values', async () => {
      const spy = spyFn((i) => i.a);
      const o = (a: string, b: number) => ({ a, b });
      const item1 = o('a', 1);
      const item2 = o('a', 2);
      const item3 = o('b', 3);
      const item4 = o('c', 4);
      const item5 = o('b', 5);
      const item6 = o('d', 6);

      const gen = AsyncGenStack.from([item1, item2, item3, item4, item5, item6]).distinctBy(spy);
      const result = await gen.toArray();
      assert.deepEqual(result, [item1, item3, item4, item6]);
      assert.isTrue(spy.called);
      assert.equal(spy.callCount, 6);
    });
  });

  describe(AsyncGenStack.prototype.peek.name, () => {
    it('should peek in the values', async () => {
      const spy = spyFn();
      const gen = AsyncGenStack.from([1, 2, 3, 4, 5, 6]).peek(spy);
      const result = await gen.toArray();
      assert.deepEqual(result, [1, 2, 3, 4, 5, 6]);
      assert.isTrue(spy.called);
      assert.strictEqual(spy.callCount, 6);
    });
  });

  describe(AsyncGenStack.prototype.skip.name, () => {
    it('should skip the first few values', async () => {
      const gen = AsyncGenStack.from([1, 2, 3, 4, 5, 6, 7, 8]).skip(3);
      const result = await gen.toArray();
      assert.deepEqual(result, [4, 5, 6, 7, 8]);
    });
  });

  describe(AsyncGenStack.prototype.skipWhile.name, () => {
    it('should skip while callback returns true', async () => {
      const spy = spyFn((i) => i !== 4);
      const gen = AsyncGenStack.from([1, 2, 3, 4, 5, 6, 7, 8]).skipWhile(spy);
      const result = await gen.toArray();
      assert.deepEqual(result, [4, 5, 6, 7, 8]);
      assert.isTrue(spy.called);
      assert.equal(spy.callCount, 4);
    });
  });

  describe(AsyncGenStack.prototype.skipUntil.name, () => {
    it('should skip while callback returns false', async () => {
      const spy = spyFn((i) => i === 4);
      const gen = AsyncGenStack.from([1, 2, 3, 4, 5, 6, 7, 8]).skipUntil(spy);
      const result = await gen.toArray();
      assert.deepEqual(result, [4, 5, 6, 7, 8]);
      assert.isTrue(spy.called);
      assert.equal(spy.callCount, 4);
    });
  });

  describe(AsyncGenStack.prototype.runWhile.name, () => {
    it('should run while callback returns true', async () => {
      const spy = spyFn((i) => i !== 4);
      const gen = AsyncGenStack.from([1, 2, 3, 4, 5, 6, 7, 8]).runWhile(spy);
      const result = await gen.toArray();
      assert.deepEqual(result, [1, 2, 3]);
      assert.isTrue(spy.called);
      assert.equal(spy.callCount, 4);
    });
  });

  describe(AsyncGenStack.prototype.runUntil.name, () => {
    it('should run while callback returns false', async () => {
      const spy = spyFn((i) => i === 4);
      const gen = AsyncGenStack.from([1, 2, 3, 4, 5, 6, 7, 8]).runUntil(spy);
      const result = await gen.toArray();
      assert.deepEqual(result, [1, 2, 3]);
      assert.isTrue(spy.called);
      assert.equal(spy.callCount, 4);
    });
  });

  describe(AsyncGenStack.prototype.merge.name, () => {
    it('should merge multiple iterators together', async () => {
      const gen = AsyncGenStack.from('aaaa').merge('bbb', 'cc', 'd');
      const result = await gen.toArray();
      assert.deepEqual(result, [...'aaaabbbccd']);
    });
  });

  describe(AsyncGenStack.prototype.interlace.name, () => {
    it('should interlace with another iterator', async () => {
      const gen = AsyncGenStack.from('aaaa').interlace(
        AsyncGenStack.from('bbbb'),
        AsyncGenStack.from('c'),
      );
      const result = await gen.toArray();
      assert.deepEqual(result, [...'abcababab']);
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
