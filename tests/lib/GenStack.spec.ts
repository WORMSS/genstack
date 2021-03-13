import { assert } from 'chai';
import { GenStack } from '../../src';
import { spyFn } from './spyFn';

describe(GenStack.name, () => {
  describe(`${GenStack.name}.${GenStack.from.name}`, () => {
    it('should create GenStack', () => {
      const gen = GenStack.from([]);
      assert.instanceOf(gen, GenStack);
    });
    it('should split a string', () => {
      const gen = GenStack.from('abcd');
      const result = gen.toArray();
      assert.deepEqual(result, [...'abcd']);
    });
  });

  describe(`${GenStack.name}.${GenStack.range.name}`, () => {
    it('should create GenStack', () => {
      const gen = GenStack.range();
      assert.instanceOf(gen, GenStack);
    });

    it('should result in incremental values by default', () => {
      const gen = GenStack.range();
      const result = popValues(gen, 5);
      assert.deepEqual(result, [0, 1, 2, 3, 4]);
    });
  });

  describe(`${GenStack.name}.${GenStack.interlace.name}`, () => {
    it('should create GenStack', () => {
      const gen = GenStack.interlace();
      assert.instanceOf(gen, GenStack);
    });

    it('should interlace values', () => {
      const gen = GenStack.interlace([], ['a', 'a', 'a'], [], ['b'], ['c', 'c']);
      const values = gen.toArray();
      assert.deepEqual(values, ['a', 'b', 'c', 'a', 'c', 'a']);
    });
  });

  describe(GenStack.prototype.limit.name, () => {
    it('should limit an unlimited list to a set size items', () => {
      const gen = GenStack.from(incrementGen()).limit(5);
      const result = gen.toArray();
      assert.deepEqual(result, [0, 1, 2, 3, 4]);
    });

    it('should limit a small list by a large limit', () => {
      const gen = GenStack.from([0, 1, 2, 3, 4]).limit(50);
      const result = gen.toArray();
      assert.deepEqual(result, [0, 1, 2, 3, 4]);
    });
  });

  describe(GenStack.prototype.filter.name, () => {
    it('should filter unwanted items', () => {
      const spy = spyFn((i) => i % 2 === 0);
      const gen = GenStack.from([0, 1, 2, 3, 4]).filter(spy);
      const result = gen.toArray();
      assert.deepEqual(result, [0, 2, 4]);
      assert.isTrue(spy.hasRun);
      assert.equal(spy.runCount, 5);
    });
  });

  describe(GenStack.prototype.map.name, () => {
    it('should map to different values', () => {
      const spy = spyFn((i) => String.fromCharCode(i + 65));
      const gen = GenStack.from([0, 1, 2, 3, 4]).map(spy);
      const result = gen.toArray();
      assert.deepEqual(result, ['A', 'B', 'C', 'D', 'E']);
      assert.isTrue(spy.hasRun);
      assert.equal(spy.runCount, 5);
    });
  });

  describe(GenStack.prototype.distinct.name, () => {
    it('should return distint values', () => {
      const gen = GenStack.from([1, 1, 3, 2, 3, 0]).distinct();
      const result = gen.toArray();
      assert.deepEqual(result, [1, 3, 2, 0]);
    });
  });

  describe(GenStack.prototype.flatMap.name, () => {
    it('should flatten the array', () => {
      const spy = spyFn((i) => i);
      const gen = GenStack.from([['a', 'b'], ['c'], ['d', 'e']]).flatMap(spy);
      const result = gen.toArray();
      assert.deepEqual(result, ['a', 'b', 'c', 'd', 'e']);
      assert.isTrue(spy.hasRun);
      assert.equal(spy.runCount, 3);
    });
  });

  describe(GenStack.prototype.distinctBy.name, () => {
    it('should return distinc by values', () => {
      const spy = spyFn((i) => i.a);
      const o = (a: string, b: number) => ({ a, b });
      const item1 = o('a', 1);
      const item2 = o('a', 2);
      const item3 = o('b', 3);
      const item4 = o('c', 4);
      const item5 = o('b', 5);
      const item6 = o('d', 6);

      const gen = GenStack.from([item1, item2, item3, item4, item5, item6]).distinctBy(spy);
      const result = gen.toArray();
      assert.deepEqual(result, [item1, item3, item4, item6]);
      assert.isTrue(spy.hasRun);
      assert.equal(spy.runCount, 6);
    });
  });

  describe(GenStack.prototype.peek.name, () => {
    it('should peek in the values', () => {
      const spy = spyFn();
      const gen = GenStack.from([1, 2, 3, 4, 5, 6]).peek(spy);
      const result = gen.toArray();
      assert.deepEqual(result, [1, 2, 3, 4, 5, 6]);
      assert.isTrue(spy.hasRun);
      assert.strictEqual(spy.runCount, 6);
    });
  });

  describe(GenStack.prototype.skip.name, () => {
    it('should skip the first few values', () => {
      const gen = GenStack.from([1, 2, 3, 4, 5, 6, 7, 8]).skip(3);
      const result = gen.toArray();
      assert.deepEqual(result, [4, 5, 6, 7, 8]);
    });
  });

  describe(GenStack.prototype.skipWhile.name, () => {
    it('should skip while callback returns true', () => {
      const spy = spyFn((i) => i !== 4);
      const gen = GenStack.from([1, 2, 3, 4, 5, 6, 7, 8]).skipWhile(spy);
      const result = gen.toArray();
      assert.deepEqual(result, [4, 5, 6, 7, 8]);
      assert.isTrue(spy.hasRun);
      assert.equal(spy.runCount, 4);
    });
  });

  describe(GenStack.prototype.skipUntil.name, () => {
    it('should skip while callback returns false', () => {
      const spy = spyFn((i) => i === 4);
      const gen = GenStack.from([1, 2, 3, 4, 5, 6, 7, 8]).skipUntil(spy);
      const result = gen.toArray();
      assert.deepEqual(result, [4, 5, 6, 7, 8]);
      assert.isTrue(spy.hasRun);
      assert.equal(spy.runCount, 4);
    });
  });

  describe(GenStack.prototype.runWhile.name, () => {
    it('should run while callback returns true', () => {
      const spy = spyFn((i) => i !== 4);
      const gen = GenStack.from([1, 2, 3, 4, 5, 6, 7, 8]).runWhile(spy);
      const result = gen.toArray();
      assert.deepEqual(result, [1, 2, 3]);
      assert.isTrue(spy.hasRun);
      assert.equal(spy.runCount, 4);
    });
  });

  describe(GenStack.prototype.runUntil.name, () => {
    it('should run while callback returns false', () => {
      const spy = spyFn((i) => i === 4);
      const gen = GenStack.from([1, 2, 3, 4, 5, 6, 7, 8]).runUntil(spy);
      const result = gen.toArray();
      assert.deepEqual(result, [1, 2, 3]);
      assert.isTrue(spy.hasRun);
      assert.equal(spy.runCount, 4);
    });
  });

  describe(GenStack.prototype.merge.name, () => {
    it('should merge multiple iterators together', () => {
      const gen = GenStack.from('aaaa').merge('bbb', 'cc', 'd');
      const result = gen.toArray();
      assert.deepEqual(result, [...'aaaabbbccd']);
    });
  });

  describe(GenStack.prototype.interlace.name, () => {
    it('should interlace with another iterator', () => {
      const gen = GenStack.from('aaaa').interlace(GenStack.from('bbbb'), GenStack.from('c'));
      const result = gen.toArray();
      assert.deepEqual(result, [...'abcababab']);
    });
  });

  describe(GenStack.prototype.toSet.name, () => {
    it('should make a Set', () => {
      const values: number[] = [];
      const spy = spyFn((i) => values.push(i));
      const gen = GenStack.from([1, 1, 3, 2, 3, 0]).peek(spy);
      const result = gen.toSet();
      assert.hasAllKeys(result, [0, 1, 2, 3]);
      assert.isTrue(spy.hasRun);
      assert.equal(spy.runCount, 6);
    });
  });
});

function* incrementGen(): Generator<number, any, unknown> {
  let a = 0;
  while (true) {
    yield a++;
  }
}

function popValues<T>(gen: GenStack<T>, size: number): T[] {
  const values: T[] = [];
  for (let i = 0; i < size; i++) {
    values.push(gen.next().value);
  }
  return values;
}
