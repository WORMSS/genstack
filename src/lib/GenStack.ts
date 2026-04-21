import { AsyncGenStack } from './AsyncGenStack.ts';
import { asyncFlatMapGen } from './intermediate/asyncFlatMapGen.ts';
import { asyncMapGen } from './intermediate/asyncMapGen.ts';
import { distinctByGen } from './intermediate/distinctByGen.ts';
import { distinctGen } from './intermediate/distinctGen.ts';
import { filterGen } from './intermediate/filterGen.ts';
import { flatMapGen } from './intermediate/flatMapGen.ts';
import { limitGen } from './intermediate/limitGen.ts';
import { mapGen } from './intermediate/mapGen.ts';
import { peekGen } from './intermediate/peekGen.ts';
import { runUntilGen } from './intermediate/runUntilGen.ts';
import { runWhileGen } from './intermediate/runWhileGen.ts';
import { skipGen } from './intermediate/skipGen.ts';
import { skipUntilGen } from './intermediate/skipUntilGen.ts';
import { skipWhileGen } from './intermediate/skipWhileGen.ts';
import { createGenerator } from './supplier/createGenerator.ts';
import { createInterlace } from './supplier/createInterlace.ts';
import { createMerge } from './supplier/createMerge.ts';
import { createRange } from './supplier/createRange.ts';
import { createReg } from './supplier/createReg.ts';
import { createWalker } from './supplier/createWalker.ts';
import type {
  AsyncFlatMapCallback,
  DisinctCallback,
  FlatMapCallback,
  GenStackFrom,
  InterlaceOptions,
  MergeOptions,
  PeekCallback,
  Predicate,
  RangeOptions,
  ToMapOptions,
  WalkerChildren,
} from './types.ts';
import { filterNull } from './utils/filterNull.ts';
import { filterNullUndefined } from './utils/filterNullUndefined.ts';
import { filterUndefined } from './utils/filterUndefined.ts';
import { getIterator } from './utils/getIterator.ts';
import { reduce } from './utils/reduce.ts';
import { some } from './utils/some.ts';
import { toMap } from './utils/toMap.ts';

export class GenStack<T> implements IterableIterator<T> {
  private readonly _input: Iterator<T>;

  /**
   * Creates a GenStack from an iterable, iterator, or array-like object.
   *
   * @param input - The source to create the GenStack from.
   * @returns A new GenStack instance.
   *
   * @example
   * ```ts
   * const stack = GenStack.from([1, 2, 3]);
   * console.log(stack.toArray()); // [1, 2, 3]
   * ```
   *
   * @example
   * ```ts
   * const stack = GenStack.from('abcd');
   * console.log(stack.toArray()); // ['a', 'b', 'c', 'd']
   * ```
   */
  public static from<T>(input: GenStackFrom<T>): GenStack<T> {
    return new GenStack(getIterator(input));
  }

  /**
   * Creates an infinite GenStack by repeatedly calling a generator function.
   *
   * @param generator - A function that returns the next value.
   * @returns A new GenStack instance.
   *
   * @example
   * ```ts
   * let i = 0;
   * const stack = GenStack.generate(() => i++);
   * console.log(stack.limit(3).toArray()); // [0, 1, 2]
   * ```
   */
  public static generate<T>(generator: () => T): GenStack<T> {
    return new GenStack(createGenerator(generator));
  }

  /**
   * Creates a GenStack that yields a range of numbers.
   *
   * @param options - Options for the range (start, end, step).
   * @returns A new GenStack instance of numbers.
   *
   * @example
   * ```ts
   * const stack = GenStack.range({ start: 0, end: 5 });
   * console.log(stack.toArray()); // [0, 1, 2, 3, 4]
   * ```
   *
   * @example
   * ```ts
   * const stack = GenStack.range({ start: 0, step: 2 }).limit(3);
   * console.log(stack.toArray()); // [0, 2, 4]
   * ```
   */
  public static range(options?: RangeOptions): GenStack<number> {
    return new GenStack(createRange(options));
  }

  /**
   * Merges multiple iterables into a single GenStack, yielding all values from the first, then all from the second, and so on.
   *
   * @param options - Iterables to merge.
   * @returns A new GenStack instance.
   *
   * @example
   * ```ts
   * const stack = GenStack.merge([1, 2], [3, 4]);
   * console.log(stack.toArray()); // [1, 2, 3, 4]
   * ```
   */
  public static merge<T>(...options: MergeOptions<T>): GenStack<T> {
    return new GenStack(createMerge(...options));
  }

  /**
   * Interlaces multiple iterables into a single GenStack, yielding one value from each iterable in turn.
   *
   * @param options - Iterables to interlace.
   * @returns A new GenStack instance.
   *
   * @example
   * ```ts
   * const stack = GenStack.interlace([1, 2, 3], ['a', 'b']);
   * console.log(stack.toArray()); // [1, 'a', 2, 'b', 3]
   * ```
   */
  public static interlace<T>(...options: InterlaceOptions<T>): GenStack<T> {
    return new GenStack(createInterlace(...options));
  }

  /**
   * Creates a GenStack by traversing a tree-like structure depth-first.
   *
   * @param node - The starting node.
   * @param children - A function that returns the children of a node.
   * @returns A new GenStack instance.
   *
   * @example
   * ```ts
   * const tree = { id: 1, children: [{ id: 2 }, { id: 3 }] };
   * const stack = GenStack.walker(tree, n => n.children);
   * console.log(stack.map(n => n.id).toArray()); // [1, 2, 3]
   * ```
   */
  public static walker<T>(node: T, children: WalkerChildren<T>): GenStack<T> {
    return new GenStack(createWalker(node, children));
  }

  /**
   * Creates a GenStack that yields matches from a regular expression.
   *
   * @param reg - The regular expression to use.
   * @param content - The string to search.
   * @returns A new GenStack instance of RegExpMatchArray.
   *
   * @example
   * ```ts
   * const stack = GenStack.reg(/a./g, 'ababac');
   * console.log(stack.map(m => m[0]).toArray()); // ['ab', 'ab', 'ac']
   * ```
   */
  public static reg(reg: string | RegExp, content: string): GenStack<RegExpMatchArray> {
    return new GenStack(createReg(reg, content));
  }

  constructor(input: Iterator<T>) {
    this._input = input;
  }

  // Limits
  /**
   * Limits the number of items yielded by the GenStack.
   *
   * @param num - The maximum number of items to yield.
   * @returns A new GenStack instance.
   *
   * @example
   * ```ts
   * const stack = GenStack.from([1, 2, 3, 4, 5]).limit(2);
   * console.log(stack.toArray()); // [1, 2]
   * ```
   */
  public limit(num: number): GenStack<T> {
    return new GenStack(limitGen(this.iterator, num));
  }

  /**
   * Yields items from the GenStack as long as the callback returns true.
   *
   * @param callbackFn - A function that returns true if the item should be yielded.
   * @returns A new GenStack instance.
   *
   * @example
   * ```ts
   * const stack = GenStack.from([1, 2, 3, 4, 1]).runWhile(n => n < 4);
   * console.log(stack.toArray()); // [1, 2, 3]
   * ```
   */
  public runWhile(callbackFn: (value: T) => boolean): GenStack<T> {
    return new GenStack(runWhileGen(this.iterator, callbackFn));
  }

  /**
   * Yields items from the GenStack until the callback returns true.
   *
   * @param callbackFn - A function that returns true if the yielding should stop.
   * @returns A new GenStack instance.
   *
   * @example
   * ```ts
   * const stack = GenStack.from([1, 2, 3, 4, 1]).runUntil(n => n === 4);
   * console.log(stack.toArray()); // [1, 2, 3]
   * ```
   */
  public runUntil(callbackFn: (value: T) => boolean): GenStack<T> {
    return new GenStack(runUntilGen(this.iterator, callbackFn));
  }

  /**
   * Filters items from the GenStack based on a predicate.
   *
   * @param predicate - A function that returns true if the item should be kept.
   * @returns A new GenStack instance.
   *
   * @example
   * ```ts
   * const stack = GenStack.from([1, 2, 3, 4]).filter(n => n % 2 === 0);
   * console.log(stack.toArray()); // [2, 4]
   * ```
   */
  public filter<S extends T>(predicate: Predicate<T, S>): GenStack<S>; // The good filter
  public filter(predicate: (n: T) => unknown): GenStack<T>; // The fall back filter
  public filter(predicate: (n: T) => unknown): GenStack<T> {
    return new GenStack(filterGen(this.iterator, predicate));
  }

  /**
   * Filters out `null` values from the GenStack.
   *
   * @returns A new GenStack instance without `null` values.
   *
   * @example
   * ```ts
   * const stack = GenStack.from([1, null, 2]).filterNull();
   * console.log(stack.toArray()); // [1, 2]
   * ```
   */
  public filterNull(): GenStack<Exclude<T, null>> {
    return this.filter(filterNull);
  }

  /**
   * Filters out `undefined` values from the GenStack.
   *
   * @returns A new GenStack instance without `undefined` values.
   *
   * @example
   * ```ts
   * const stack = GenStack.from([1, undefined, 2]).filterUndefined();
   * console.log(stack.toArray()); // [1, 2]
   * ```
   */
  public filterUndefined(): GenStack<Exclude<T, undefined>> {
    return this.filter(filterUndefined);
  }

  /**
   * Filters out both `null` and `undefined` values from the GenStack.
   *
   * @returns A new GenStack instance without `null` or `undefined` values.
   *
   * @example
   * ```ts
   * const stack = GenStack.from([1, null, undefined, 2]).filterNullUndefined();
   * console.log(stack.toArray()); // [1, 2]
   * ```
   */
  public filterNullUndefined(): GenStack<Exclude<T, null | undefined>> {
    return this.filter(filterNullUndefined);
  }

  /**
   * Skips a specified number of items from the GenStack.
   *
   * @param skip - The number of items to skip.
   * @returns A new GenStack instance.
   *
   * @example
   * ```ts
   * const stack = GenStack.from([1, 2, 3, 4]).skip(2);
   * console.log(stack.toArray()); // [3, 4]
   * ```
   */
  public skip(skip: number): GenStack<T> {
    return new GenStack(skipGen(this.iterator, skip));
  }

  /**
   * Skips items from the GenStack as long as the callback returns true.
   *
   * @param callbackFn - A function that returns true if the item should be skipped.
   * @returns A new GenStack instance.
   *
   * @example
   * ```ts
   * const stack = GenStack.from([1, 2, 3, 4, 1]).skipWhile(n => n < 3);
   * console.log(stack.toArray()); // [3, 4, 1]
   * ```
   */
  public skipWhile(callbackFn: (value: T) => boolean): GenStack<T> {
    return new GenStack(skipWhileGen(this.iterator, callbackFn));
  }

  /**
   * Skips items from the GenStack until the callback returns true.
   *
   * @param callbackFn - A function that returns true if the skipping should stop.
   * @returns A new GenStack instance.
   *
   * @example
   * ```ts
   * const stack = GenStack.from([1, 2, 3, 4, 1]).skipUntil(n => n === 3);
   * console.log(stack.toArray()); // [3, 4, 1]
   * ```
   */
  public skipUntil(callbackFn: (value: T) => boolean): GenStack<T> {
    return new GenStack(skipUntilGen(this.iterator, callbackFn));
  }

  /**
   * Filters out duplicate items from the GenStack.
   *
   * @returns A new GenStack instance with distinct values.
   *
   * @example
   * ```ts
   * const stack = GenStack.from([1, 2, 1, 3, 2]).distinct();
   * console.log(stack.toArray()); // [1, 2, 3]
   * ```
   */
  public distinct(): GenStack<T> {
    return new GenStack(distinctGen(this.iterator));
  }

  /**
   * Filters out duplicate items from the GenStack based on a key returned by the callback.
   *
   * @param callbackFn - A function that returns the key to use for distinctness.
   * @returns A new GenStack instance.
   *
   * @example
   * ```ts
   * const stack = GenStack.from([{ id: 1 }, { id: 2 }, { id: 1 }]).distinctBy(n => n.id);
   * console.log(stack.toArray()); // [{ id: 1 }, { id: 2 }]
   * ```
   */
  public distinctBy<U>(callbackFn: DisinctCallback<T, U>): GenStack<T> {
    return new GenStack(distinctByGen(this.iterator, callbackFn));
  }

  // Mapping
  /**
   * Transforms each item in the GenStack using the provided callback.
   *
   * @param callbackfn - A function that transforms each item.
   * @returns A new GenStack instance with the transformed items.
   *
   * @example
   * ```ts
   * const stack = GenStack.from([1, 2, 3]).map(n => n * 2);
   * console.log(stack.toArray()); // [2, 4, 6]
   * ```
   */
  public map<U>(callbackfn: (value: T) => U): GenStack<U> {
    return new GenStack(mapGen(this.iterator, callbackfn));
  }

  /**
   * Transforms each item in the GenStack using the provided asynchronous callback, returning an AsyncGenStack.
   *
   * @param callbackFn - An asynchronous function that transforms each item.
   * @returns A new AsyncGenStack instance.
   *
   * @example
   * ```ts
   * const stack = GenStack.from([1, 2, 3]).mapAsync(async n => n * 2);
   * console.log(await stack.toArray()); // [2, 4, 6]
   * ```
   */
  public mapAsync<U>(callbackFn: (value: T) => U | PromiseLike<U>): AsyncGenStack<U> {
    return new AsyncGenStack(asyncMapGen(this.iterator, callbackFn));
  }

  // Expand
  /**
   * Transforms each item into an iterable and flattens the result into a single GenStack.
   *
   * @param callbackFn - A function that returns an iterable for each item.
   * @returns A new GenStack instance with the flattened items.
   *
   * @example
   * ```ts
   * const stack = GenStack.from([1, 2]).flatMap(n => [n, n * 10]);
   * console.log(stack.toArray()); // [1, 10, 2, 20]
   * ```
   */
  public flatMap<U>(callbackFn: FlatMapCallback<T, U>): GenStack<U> {
    return new GenStack(flatMapGen(this.iterator, callbackFn));
  }

  /**
   * Transforms each item into an asynchronous iterable and flattens the result into a single AsyncGenStack.
   *
   * @param callbackFn - An asynchronous function that returns an iterable for each item.
   * @returns A new AsyncGenStack instance.
   *
   * @example
   * ```ts
   * const stack = GenStack.from([1, 2]).flatMapAsync(async n => [n, n * 10]);
   * console.log(await stack.toArray()); // [1, 10, 2, 20]
   * ```
   */
  public flatMapAsync<U>(callbackFn: AsyncFlatMapCallback<T, U>): AsyncGenStack<U> {
    return new AsyncGenStack(asyncFlatMapGen(this.iterator, callbackFn));
  }

  /**
   * Recursively traverses items in the GenStack using the provided children function.
   *
   * @param children - A function that returns the children of a node.
   * @returns A new GenStack instance.
   *
   * @example
   * ```ts
   * const stack = GenStack.from([{ id: 1, children: [{ id: 2 }] }]).walker(n => n.children);
   * console.log(stack.map(n => n.id).toArray()); // [1, 2]
   * ```
   */
  public walker(children: WalkerChildren<T>): GenStack<T> {
    return this.flatMap((node) => GenStack.walker(node, children));
  }

  // Merging
  /**
   * Merges other iterables with this GenStack.
   *
   * @param options - The iterables to merge.
   * @returns A new GenStack instance.
   *
   * @example
   * ```ts
   * const stack = GenStack.from([1, 2]).merge([3, 4]);
   * console.log(stack.toArray()); // [1, 2, 3, 4]
   * ```
   */
  public merge(...options: MergeOptions<T>): GenStack<T> {
    return GenStack.merge(this, ...options);
  }

  /**
   * Interlaces other iterables with this GenStack.
   *
   * @param options - The iterables to interlace.
   * @returns A new GenStack instance.
   *
   * @example
   * ```ts
   * const stack = GenStack.from([1, 2, 3]).interlace(['a', 'b']);
   * console.log(stack.toArray()); // [1, 'a', 2, 'b', 3]
   * ```
   */
  public interlace(...options: InterlaceOptions<T>): GenStack<T> {
    return GenStack.interlace(this, ...options);
  }

  // Utils
  /**
   * Performs an action for each item in the GenStack without modifying the stream.
   *
   * @param callbackFn - A function to call for each item.
   * @returns The same GenStack instance.
   *
   * @example
   * ```ts
   * const stack = GenStack.from([1, 2, 3]).peek(n => console.log(n));
   * console.log(stack.toArray()); // [1, 2, 3] (logs 1, 2, 3)
   * ```
   */
  public peek(callbackFn: PeekCallback<T>): GenStack<T> {
    return new GenStack(peekGen(this.iterator, callbackFn));
  }

  // Terminators
  /**
   * Collects all items in the GenStack into an array.
   *
   * @returns An array containing all items from the GenStack.
   *
   * @example
   * ```ts
   * const items = GenStack.from([1, 2, 3]).toArray();
   * console.log(items); // [1, 2, 3]
   * ```
   */
  public toArray(): T[] {
    return [...this];
  }

  /**
   * Collects all items in the GenStack into a Map.
   *
   * @param keyOrOptions - A function to extract the key, or an options object.
   * @param value - A function to extract the value.
   * @returns A Map containing the items.
   *
   * @example
   * ```ts
   * const map = GenStack.from(['a', 'b']).toMap();
   * console.log(map.get('a')); // 'a'
   * ```
   *
   * @example
   * ```ts
   * const map = GenStack.from([{ id: 1, val: 'ok' }]).toMap(i => i.id, i => i.val);
   * console.log(map.get(1)); // 'ok'
   * ```
   */
  public toMap(): Map<T, T>;
  public toMap<K, V>(options: ToMapOptions<T, K, V>): Map<K, V>;
  public toMap<K, V>(key?: ((i: T) => K) | null, value?: (i: T) => V): Map<K, V>;
  public toMap<K, V>(
    keyOrOptions?: ToMapOptions<T, K, V> | ((i: T) => K) | null,
    value?: (i: T) => V,
  ): Map<K, V> {
    return toMap(this.iterator, keyOrOptions as any, value);
  }

  /**
   * Reduces the GenStack to a single value using the provided callback.
   *
   * @param callbackFn - A function that combines the previous and current values.
   * @param initialValue - An optional initial value for the reduction.
   * @returns The reduced value.
   *
   * @example
   * ```ts
   * const sum = GenStack.from([1, 2, 3]).reduce((p, c) => p + c);
   * console.log(sum); // 6
   * ```
   *
   * @example
   * ```ts
   * const joined = GenStack.from([1, 2, 3]).reduce((p, c) => p + '-' + c, '0');
   * console.log(joined); // '0-1-2-3'
   * ```
   */
  public reduce(callbackFn: (previous: T, current: T) => T): T;
  public reduce<U>(callbackFn: (previous: U, current: T) => U, initialValue: U): U;
  public reduce<U = T>(callbackFn: (previous: U, current: T) => U, initialValue?: U): U {
    return reduce(this.iterator, callbackFn, initialValue);
  }

  /**
   * Returns true if at least one item in the GenStack matches the predicate.
   *
   * @param predicate - A function to test each item.
   * @returns True if any item matches, otherwise false.
   *
   * @example
   * ```ts
   * const hasEven = GenStack.from([1, 2, 3]).some(n => n % 2 === 0);
   * console.log(hasEven); // true
   * ```
   */
  public some(predicate: (item: T, index: number) => unknown): boolean {
    return some(this.iterator, predicate);
  }

  // Incase someone doesn't understand how this works
  /**
   * Returns the underlying iterator.
   */
  public get iterator(): Iterator<T> {
    return this._input;
  }

  // Needed for IterableIterator interface
  /**
   * Returns this GenStack as an iterator.
   */
  public [Symbol.iterator](): GenStack<T> {
    return this;
  }

  // Needed for IterableIterator interface
  /**
   * Returns the next item from the GenStack.
   */
  public next(...args: []): IteratorResult<T> {
    return this.iterator.next(...args);
  }

  // Nice things to have
  get [Symbol.toStringTag]() {
    return 'GenStack';
  }
}
