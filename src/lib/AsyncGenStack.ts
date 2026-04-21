import { asyncDistinctByGen } from './intermediate/asyncDistinctByGen.ts';
import { asyncDistinctGen } from './intermediate/asyncDistinctGen.ts';
import { asyncFilterGen } from './intermediate/asyncFilterGen.ts';
import { asyncFlatMapGen } from './intermediate/asyncFlatMapGen.ts';
import { asyncLimitGen } from './intermediate/asyncLimitGen.ts';
import { asyncMapGen } from './intermediate/asyncMapGen.ts';
import { asyncPeekGen } from './intermediate/asyncPeekGen.ts';
import { asyncRunUntilGen } from './intermediate/asyncRunUntilGen.ts';
import { asyncRunWhileGen } from './intermediate/asyncRunWhileGen.ts';
import { asyncSkipGen } from './intermediate/asyncSkipGen.ts';
import { asyncSkipUntilGen } from './intermediate/asyncSkipUntilGen.ts';
import { asyncSkipWhileGen } from './intermediate/asyncSkipWhileGen.ts';
import { createAsyncGenerator } from './supplier/createAsyncGenerator.ts';
import { createAsyncInterlace } from './supplier/createAsyncInterlace.ts';
import { createAsyncMerge } from './supplier/createAsyncMerge.ts';
import { createAsyncWalker } from './supplier/createAsyncWalker.ts';
import { createRange } from './supplier/createRange.ts';
import { createReg } from './supplier/createReg.ts';
import type {
  AsyncDisinctCallback,
  AsyncFlatMapCallback,
  AsyncInterlaceOptions,
  AsyncMergeOptions,
  AsyncPredicate,
  AsyncStackFrom,
  AsyncToMapOptions,
  AsyncWalkerChildren,
  PeekCallback,
  Predicate,
  RangeOptions,
} from './types.ts';
import { asyncReduce } from './utils/asyncReduce.ts';
import { asyncSome } from './utils/asyncSome.ts';
import { asyncToArray } from './utils/asyncToArray.ts';
import { asyncToMap } from './utils/asyncToMap.ts';
import { filterNull } from './utils/filterNull.ts';
import { filterNullUndefined } from './utils/filterNullUndefined.ts';
import { filterUndefined } from './utils/filterUndefined.ts';
import { getAsyncIterator } from './utils/getAsyncIterator.ts';
import { wrapToAsyncIterator } from './utils/wrapToAsyncIterator.ts';

/**
 * A wrapper for AsyncIterators that provides a chainable API for common transformations.
 * It implements `AsyncIterableIterator`, so it can be used in `for await...of` loops.
 *
 * @template T The type of elements in the stack.
 */
export class AsyncGenStack<T> implements AsyncIterableIterator<T> {
  private readonly _input: AsyncIterator<T>;

  /**
   * Creates an `AsyncGenStack` from various types of async or sync iterables and iterators.
   *
   * @template T The type of elements in the stack.
   * @param input The source to create the stack from. Can be an Iterable, AsyncIterable, Iterator, or AsyncIterator.
   * @returns A new `AsyncGenStack` instance.
   *
   * @example
   * ```typescript
   * const stack = AsyncGenStack.from([1, 2, 3]);
   * const result = await stack.toArray(); // [1, 2, 3]
   *
   * const asyncIterable = (async function*() { yield 'a'; yield 'b'; })();
   * const asyncStack = AsyncGenStack.from(asyncIterable);
   * for await (const item of asyncStack) {
   *   console.log(item); // 'a', then 'b'
   * }
   * ```
   */
  public static from<T>(input: AsyncStackFrom<T>): AsyncGenStack<T> {
    return new AsyncGenStack(getAsyncIterator(input));
  }

  /**
   * Creates an `AsyncGenStack` by repeatedly calling a generator function.
   * Note: This creates an infinite stack unless limited or the generator throws/returns a terminal value if expected.
   *
   * @template T The type of elements generated.
   * @param generator A function that returns a value or a promise of a value.
   * @returns A new `AsyncGenStack` instance.
   *
   * @example
   * ```typescript
   * let count = 0;
   * const stack = AsyncGenStack.generate(async () => {
   *   return count++;
   * }).limit(3);
   *
   * const result = await stack.toArray(); // [0, 1, 2]
   * ```
   */
  public static generate<T>(generator: () => PromiseLike<T> | T): AsyncGenStack<T> {
    return new AsyncGenStack(createAsyncGenerator(generator));
  }

  /**
   * Creates an `AsyncGenStack` that yields a sequence of numbers.
   *
   * @param options Configuration for the range (start, end, step).
   * @returns A new `AsyncGenStack` instance of numbers.
   *
   * @example
   * ```typescript
   * const stack = AsyncGenStack.range({ start: 1, end: 5, step: 2 });
   * const result = await stack.toArray(); // [1, 3]
   *
   * const infinite = AsyncGenStack.range({ start: 0, step: 1 }).limit(3);
   * const items = await infinite.toArray(); // [0, 1, 2]
   * ```
   */
  public static range(options?: RangeOptions): AsyncGenStack<number> {
    return new AsyncGenStack(wrapToAsyncIterator(createRange(options)));
  }

  /**
   * Merges multiple iterables/iterators into a single `AsyncGenStack`.
   * It yields all values from the first source, then all from the second, and so on.
   *
   * @template T The type of elements in the stack.
   * @param options The sources to merge.
   * @returns A new `AsyncGenStack` instance.
   *
   * @example
   * ```typescript
   * const stack = AsyncGenStack.merge([1, 2], AsyncGenStack.from([3, 4]));
   * const result = await stack.toArray(); // [1, 2, 3, 4]
   * ```
   */
  public static merge<T>(...options: AsyncMergeOptions<T>): AsyncGenStack<T> {
    return new AsyncGenStack(createAsyncMerge(...options));
  }

  /**
   * Interlaces multiple iterables/iterators into a single `AsyncGenStack`.
   * It yields the first value from each source, then the second from each, and so on.
   *
   * @template T The type of elements in the stack.
   * @param options The sources to interlace.
   * @returns A new `AsyncGenStack` instance.
   *
   * @example
   * ```typescript
   * const stack = AsyncGenStack.interlace([1, 2], ['a', 'b']);
   * const result = await stack.toArray(); // [1, 'a', 2, 'b']
   * ```
   */
  public static interlace<T>(...options: AsyncInterlaceOptions<T>): AsyncGenStack<T> {
    return new AsyncGenStack(createAsyncInterlace(...options));
  }

  /**
   * Creates an `AsyncGenStack` by performing a depth-first traversal of a tree-like structure.
   *
   * @template T The type of nodes in the structure.
   * @param node The root node to start traversal from.
   * @param children A function that returns the children of a node. Can be async.
   * @returns A new `AsyncGenStack` instance.
   *
   * @example
   * ```typescript
   * const tree = { id: 1, children: [{ id: 2 }, { id: 3 }] };
   * const stack = AsyncGenStack.walker(tree, n => n.children);
   * const ids = await stack.map(n => n.id).toArray(); // [1, 2, 3]
   * ```
   */
  public static walker<T>(node: T, children: AsyncWalkerChildren<T>): AsyncGenStack<T> {
    return new AsyncGenStack(createAsyncWalker(node, children));
  }

  /**
   * Creates an `AsyncGenStack` from regular expression matches in a string.
   *
   * @param reg The regular expression (string or RegExp).
   * @param content The string to search.
   * @returns A new `AsyncGenStack` instance of RegExpMatchArray.
   *
   * @example
   * ```typescript
   * const stack = AsyncGenStack.reg(/\d+/g, "123 abc 456");
   * const matches = await stack.map(m => m[0]).toArray(); // ["123", "456"]
   * ```
   */
  public static reg(reg: string | RegExp, content: string): AsyncGenStack<RegExpMatchArray> {
    return new AsyncGenStack(wrapToAsyncIterator(createReg(reg, content)));
  }

  /**
   * @param input The underlying `AsyncIterator` for this stack.
   */
  constructor(input: AsyncIterator<T>) {
    this._input = input;
  }

  // Limits
  /**
   * Limits the number of elements yielded by the stack.
   *
   * @param num The maximum number of elements to yield.
   * @returns A new `AsyncGenStack` instance.
   *
   * @example
   * ```typescript
   * const stack = AsyncGenStack.range().limit(3);
   * const result = await stack.toArray(); // [0, 1, 2]
   * ```
   */
  public limit(num: number): AsyncGenStack<T> {
    return new AsyncGenStack(asyncLimitGen(this.iterator, num));
  }

  /**
   * Yields elements from the stack as long as the predicate returns `true`.
   *
   * @param callbackFn A function that returns `true` to continue yielding.
   * @returns A new `AsyncGenStack` instance.
   *
   * @example
   * ```typescript
   * const stack = AsyncGenStack.from([1, 2, 3, 4, 1]).runWhile(v => v < 4);
   * const result = await stack.toArray(); // [1, 2, 3]
   * ```
   */
  public runWhile(callbackFn: (value: T) => boolean): AsyncGenStack<T> {
    return new AsyncGenStack(asyncRunWhileGen(this.iterator, callbackFn));
  }

  /**
   * Yields elements from the stack until the predicate returns `true`.
   * The element that satisfies the predicate is NOT included.
   *
   * @param callbackFn A function that returns `true` to stop yielding.
   * @returns A new `AsyncGenStack` instance.
   *
   * @example
   * ```typescript
   * const stack = AsyncGenStack.from([1, 2, 3, 4, 1]).runUntil(v => v === 4);
   * const result = await stack.toArray(); // [1, 2, 3]
   * ```
   */
  public runUntil(callbackFn: (value: T) => boolean): AsyncGenStack<T> {
    return new AsyncGenStack(asyncRunUntilGen(this.iterator, callbackFn));
  }

  // Filtering

  /**
   * Filters elements of the stack based on a predicate.
   *
   * @param predicate A function that returns a truthy value to include the element. Supports both sync and async predicates.
   * @returns A new `AsyncGenStack` instance.
   *
   * @example
   * ```typescript
   * const stack = AsyncGenStack.from([1, 2, 3, 4]).filter(v => v % 2 === 0);
   * const result = await stack.toArray(); // [2, 4]
   *
   * const asyncStack = AsyncGenStack.from([1, 2, 3]).filter(async v => v > 1);
   * const asyncResult = await asyncStack.toArray(); // [2, 3]
   * ```
   */
  public filter<S extends T>(predicate: Predicate<T, S>): AsyncGenStack<S>; // The good sync filter
  public filter<S>(predicate: AsyncPredicate<T>): AsyncGenStack<S>; // The meh async filter https://github.com/microsoft/TypeScript/issues/37681
  public filter(predicate: (n: T) => unknown | PromiseLike<unknown>): AsyncGenStack<T>; // The fall back filter
  // REAL METHOD
  public filter(predicate: (n: T) => unknown | PromiseLike<unknown>): AsyncGenStack<T> {
    return new AsyncGenStack(asyncFilterGen(this.iterator, predicate));
  }

  /**
   * Filters out `null` elements from the stack.
   *
   * @returns A new `AsyncGenStack` instance without `null` values.
   */
  public filterNull(): AsyncGenStack<Exclude<T, null>> {
    return this.filter(filterNull);
  }

  /**
   * Filters out `undefined` elements from the stack.
   *
   * @returns A new `AsyncGenStack` instance without `undefined` values.
   */
  public filterUndefined(): AsyncGenStack<Exclude<T, undefined>> {
    return this.filter(filterUndefined);
  }

  /**
   * Filters out both `null` and `undefined` elements from the stack.
   *
   * @returns A new `AsyncGenStack` instance without `null` or `undefined` values.
   */
  public filterNullUndefined(): AsyncGenStack<Exclude<T, null | undefined>> {
    return this.filter(filterNullUndefined);
  }

  /**
   * Skips the specified number of elements from the beginning of the stack.
   *
   * @param skip The number of elements to skip.
   * @returns A new `AsyncGenStack` instance.
   *
   * @example
   * ```typescript
   * const stack = AsyncGenStack.from([1, 2, 3, 4]).skip(2);
   * const result = await stack.toArray(); // [3, 4]
   * ```
   */
  public skip(skip: number): AsyncGenStack<T> {
    return new AsyncGenStack(asyncSkipGen(this.iterator, skip));
  }

  /**
   * Skips elements from the stack as long as the predicate returns `true`.
   *
   * @param callbackFn A function that returns `true` to continue skipping.
   * @returns A new `AsyncGenStack` instance.
   *
   * @example
   * ```typescript
   * const stack = AsyncGenStack.from([1, 2, 3, 4, 1]).skipWhile(v => v < 3);
   * const result = await stack.toArray(); // [3, 4, 1]
   * ```
   */
  public skipWhile(callbackFn: (value: T) => boolean): AsyncGenStack<T> {
    return new AsyncGenStack(asyncSkipWhileGen(this.iterator, callbackFn));
  }

  /**
   * Skips elements from the stack until the predicate returns `true`.
   *
   * @param callbackFn A function that returns `true` to stop skipping.
   * @returns A new `AsyncGenStack` instance.
   *
   * @example
   * ```typescript
   * const stack = AsyncGenStack.from([1, 2, 3, 4, 1]).skipUntil(v => v === 3);
   * const result = await stack.toArray(); // [3, 4, 1]
   * ```
   */
  public skipUntil(callbackFn: (value: T) => boolean): AsyncGenStack<T> {
    return new AsyncGenStack(asyncSkipUntilGen(this.iterator, callbackFn));
  }

  /**
   * Returns a stack yielding only unique elements.
   *
   * @returns A new `AsyncGenStack` instance with unique elements.
   *
   * @example
   * ```typescript
   * const stack = AsyncGenStack.from([1, 2, 2, 3, 1]).distinct();
   * const result = await stack.toArray(); // [1, 2, 3]
   * ```
   */
  public distinct(): AsyncGenStack<T> {
    return new AsyncGenStack(asyncDistinctGen(this.iterator));
  }

  /**
   * Returns a stack yielding only unique elements based on a key returned by the callback function.
   *
   * @template U The type of the key used for comparison.
   * @param callbackFn A function that returns the key for an element. Can be async.
   * @returns A new `AsyncGenStack` instance.
   *
   * @example
   * ```typescript
   * const stack = AsyncGenStack.from([{ id: 1 }, { id: 2 }, { id: 1 }])
   *   .distinctBy(v => v.id);
   * const result = await stack.toArray(); // [{ id: 1 }, { id: 2 }]
   * ```
   */
  public distinctBy<U>(callbackFn: AsyncDisinctCallback<T, U>): AsyncGenStack<T> {
    return new AsyncGenStack(asyncDistinctByGen(this.iterator, callbackFn));
  }

  // Mapping
  /**
   * Transforms each element of the stack using a mapping function.
   *
   * @template U The type of the transformed elements.
   * @param callbackfn A function that transforms an element. Can be sync or async.
   * @returns A new `AsyncGenStack` instance.
   *
   * @example
   * ```typescript
   * const stack = AsyncGenStack.from([1, 2, 3]).map(v => v * 2);
   * const result = await stack.toArray(); // [2, 4, 6]
   *
   * const asyncStack = AsyncGenStack.from([1, 2]).map(async v => v.toString());
   * const asyncResult = await asyncStack.toArray(); // ["1", "2"]
   * ```
   */
  public map<U>(callbackfn: (value: T) => U | PromiseLike<U>): AsyncGenStack<U> {
    return new AsyncGenStack(asyncMapGen(this.iterator, callbackfn));
  }

  /**
   * Alias for `map`.
   *
   * @template U The type of the transformed elements.
   * @param callbackFn A function that transforms an element.
   * @returns A new `AsyncGenStack` instance.
   */
  public mapAsync<U>(callbackFn: (value: T) => U | PromiseLike<U>): AsyncGenStack<U> {
    return this.map(callbackFn);
  }

  // Expand
  /**
   * Transforms each element into an iterable/iterator and flattens the result.
   *
   * @template U The type of the elements in the flattened stack.
   * @param callbackFn A function that returns an iterable or iterator for an element.
   * @returns A new `AsyncGenStack` instance.
   *
   * @example
   * ```typescript
   * const stack = AsyncGenStack.from([1, 2]).flatMap(v => [v, v * 10]);
   * const result = await stack.toArray(); // [1, 10, 2, 20]
   * ```
   */
  public flatMap<U>(callbackFn: AsyncFlatMapCallback<T, U>): AsyncGenStack<U> {
    return new AsyncGenStack(asyncFlatMapGen(this.iterator, callbackFn));
  }

  /**
   * Alias for `flatMap`.
   *
   * @template U The type of the elements in the flattened stack.
   * @param callbackFn A function that returns an iterable or iterator for an element.
   * @returns A new `AsyncGenStack` instance.
   */
  public flatMapAsync<U>(callbackFn: AsyncFlatMapCallback<T, U>): AsyncGenStack<U> {
    return this.flatMap(callbackFn);
  }

  /**
   * Performs a depth-first traversal for each element in the stack.
   *
   * @param children A function that returns the children of an element.
   * @returns A new `AsyncGenStack` instance.
   *
   * @example
   * ```typescript
   * const roots = [{ id: 1, children: [{ id: 2 }] }, { id: 3 }];
   * const stack = AsyncGenStack.from(roots).walker(n => n.children);
   * const ids = await stack.map(n => n.id).toArray(); // [1, 2, 3]
   * ```
   */
  public walker(children: AsyncWalkerChildren<T>): AsyncGenStack<T> {
    return this.flatMap((node) => AsyncGenStack.walker(node, children));
  }

  // Merging
  /**
   * Merges other iterables/iterators into this stack.
   *
   * @param options The sources to merge.
   * @returns A new `AsyncGenStack` instance.
   */
  public merge(...options: AsyncMergeOptions<T>): AsyncGenStack<T> {
    return AsyncGenStack.merge(this, ...options);
  }

  /**
   * Interlaces other iterables/iterators with this stack.
   *
   * @param options The sources to interlace.
   * @returns A new `AsyncGenStack` instance.
   */
  public interlace(...options: AsyncInterlaceOptions<T>): AsyncGenStack<T> {
    return AsyncGenStack.interlace(this, ...options);
  }

  // Utils
  /**
   * Executes a callback for each element without modifying the stack.
   * Useful for debugging or side effects.
   *
   * @param callbackFn A function to execute for each element.
   * @returns A new `AsyncGenStack` instance.
   *
   * @example
   * ```typescript
   * const stack = AsyncGenStack.from([1, 2, 3]).peek(v => console.log(v));
   * const result = await stack.toArray(); // Logs 1, 2, 3; returns [1, 2, 3]
   * ```
   */
  public peek(callbackFn: PeekCallback<T>): AsyncGenStack<T> {
    return new AsyncGenStack(asyncPeekGen(this.iterator, callbackFn));
  }

  // Terminators
  /**
   * Collects all elements of the stack into an array.
   * This is a terminal operation that consumes the stack.
   *
   * @returns A promise that resolves to an array of elements.
   *
   * @example
   * ```typescript
   * const result = await AsyncGenStack.from([1, 2, 3]).toArray(); // [1, 2, 3]
   * ```
   */
  public toArray(): Promise<T[]> {
    return asyncToArray(this);
  }

  /**
   * Collects elements of the stack into a `Map`.
   * This is a terminal operation that consumes the stack.
   *
   * @template K The type of the map keys.
   * @template V The type of the map values.
   * @param keyOrOptions Either a key mapper function, or an options object.
   * @param value A value mapper function.
   * @returns A promise that resolves to a `Map`.
   *
   * @example
   * ```typescript
   * const stack = AsyncGenStack.from([{ id: 'a', val: 1 }, { id: 'b', val: 2 }]);
   * const map = await stack.toMap(item => item.id, item => item.val);
   * // Map { 'a' => 1, 'b' => 2 }
   * ```
   */
  public toMap(): Promise<Map<T, T>>;
  public toMap<K, V>(options: AsyncToMapOptions<T, K, V>): Promise<Map<K, V>>;
  public toMap<K, V>(
    key?: ((i: T) => K | PromiseLike<K>) | null,
    value?: (i: T) => V | PromiseLike<V>,
  ): Promise<Map<K, V>>;
  public toMap<K, V>(
    keyOrOptions?: AsyncToMapOptions<T, K, V> | ((i: T) => K | PromiseLike<K>) | null,
    value?: (i: T) => V | PromiseLike<V>,
  ): Promise<Map<K, V>> {
    return asyncToMap(this.iterator, keyOrOptions as any, value);
  }

  /**
   * Reduces the stack to a single value using an accumulator function.
   * This is a terminal operation that consumes the stack.
   *
   * @template U The type of the accumulated value.
   * @param callbackFn A function that combines the accumulator and the current element.
   * @param initialValue The initial value for the accumulator.
   * @returns A promise that resolves to the reduced value.
   *
   * @example
   * ```typescript
   * const sum = await AsyncGenStack.from([1, 2, 3]).reduce((acc, val) => acc + val, 0); // 6
   * ```
   */
  public reduce(callbackFn: (previous: T, current: T) => T): PromiseLike<T>;
  public reduce<U>(callbackFn: (previous: U, current: T) => U, initialValue: U): PromiseLike<U>;
  public reduce<U = T>(
    callbackFn: (previous: U, current: T) => U,
    initialValue?: U,
  ): PromiseLike<U> {
    return asyncReduce(this.iterator, callbackFn, initialValue);
  }

  /**
   * Tests whether at least one element in the stack passes the predicate.
   * This is a terminal operation that may consume part or all of the stack.
   *
   * @param predicate A function that tests each element. Can be sync or async.
   * @returns A promise that resolves to `true` if any element passes the predicate, otherwise `false`.
   *
   * @example
   * ```typescript
   * const hasEven = await AsyncGenStack.from([1, 3, 4]).some(v => v % 2 === 0); // true
   * ```
   */
  public some(
    predicate: (item: T, index: number) => unknown | PromiseLike<unknown>,
  ): PromiseLike<boolean> {
    return asyncSome(this.iterator, predicate);
  }

  /**
   * Gets the underlying `AsyncIterator`.
   */
  public get iterator(): AsyncIterator<T> {
    return this._input;
  }

  /**
   * Returns this stack as an `AsyncIterableIterator`.
   * Needed for `AsyncIterableIterator` interface.
   */
  public [Symbol.asyncIterator](): AsyncIterableIterator<T> {
    return this;
  }

  /**
   * Advances the stack to the next element.
   * Needed for `AsyncIterableIterator` interface.
   *
   * @returns A promise that resolves to the next `IteratorResult`.
   */
  public next(...args: []): Promise<IteratorResult<T>> {
    return this.iterator.next(...args);
  }

  // Nice things to have
  get [Symbol.toStringTag]() {
    return 'AsyncGenStack';
  }
}
