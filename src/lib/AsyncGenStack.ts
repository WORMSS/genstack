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

export class AsyncGenStack<T> implements AsyncIterableIterator<T> {
  private readonly _input: AsyncIterator<T>;

  public static from<T>(input: AsyncStackFrom<T>): AsyncGenStack<T> {
    return new AsyncGenStack(getAsyncIterator(input));
  }

  public static generate<T>(generator: () => PromiseLike<T> | T): AsyncGenStack<T> {
    return new AsyncGenStack(createAsyncGenerator(generator));
  }

  public static range(options?: RangeOptions): AsyncGenStack<number> {
    return new AsyncGenStack(wrapToAsyncIterator(createRange(options)));
  }

  public static merge<T>(...options: AsyncMergeOptions<T>): AsyncGenStack<T> {
    return new AsyncGenStack(createAsyncMerge(...options));
  }

  public static interlace<T>(...options: AsyncInterlaceOptions<T>): AsyncGenStack<T> {
    return new AsyncGenStack(createAsyncInterlace(...options));
  }

  public static walker<T>(node: T, children: AsyncWalkerChildren<T>): AsyncGenStack<T> {
    return new AsyncGenStack(createAsyncWalker(node, children));
  }

  public static reg(reg: string | RegExp, content: string): AsyncGenStack<RegExpMatchArray> {
    return new AsyncGenStack(wrapToAsyncIterator(createReg(reg, content)));
  }

  constructor(input: AsyncIterator<T>) {
    this._input = input;
  }

  // Limits
  public limit(num: number): AsyncGenStack<T> {
    return new AsyncGenStack(asyncLimitGen(this.iterator, num));
  }

  public runWhile(callbackFn: (value: T) => boolean): AsyncGenStack<T> {
    return new AsyncGenStack(asyncRunWhileGen(this.iterator, callbackFn));
  }

  public runUntil(callbackFn: (value: T) => boolean): AsyncGenStack<T> {
    return new AsyncGenStack(asyncRunUntilGen(this.iterator, callbackFn));
  }

  // Filtering

  public filter<S extends T>(predicate: Predicate<T, S>): AsyncGenStack<S>; // The good sync filter
  public filter<S>(predicate: AsyncPredicate<T>): AsyncGenStack<S>; // The meh async filter https://github.com/microsoft/TypeScript/issues/37681
  public filter(predicate: (n: T) => unknown | PromiseLike<unknown>): AsyncGenStack<T>; // The fall back filter
  // REAL METHOD
  public filter(predicate: (n: T) => unknown | PromiseLike<unknown>): AsyncGenStack<T> {
    return new AsyncGenStack(asyncFilterGen(this.iterator, predicate));
  }

  public filterNull(): AsyncGenStack<Exclude<T, null>> {
    return this.filter(filterNull);
  }

  public filterUndefined(): AsyncGenStack<Exclude<T, undefined>> {
    return this.filter(filterUndefined);
  }

  public filterNullUndefined(): AsyncGenStack<Exclude<T, null | undefined>> {
    return this.filter(filterNullUndefined);
  }

  public skip(skip: number): AsyncGenStack<T> {
    return new AsyncGenStack(asyncSkipGen(this.iterator, skip));
  }

  public skipWhile(callbackFn: (value: T) => boolean): AsyncGenStack<T> {
    return new AsyncGenStack(asyncSkipWhileGen(this.iterator, callbackFn));
  }

  public skipUntil(callbackFn: (value: T) => boolean): AsyncGenStack<T> {
    return new AsyncGenStack(asyncSkipUntilGen(this.iterator, callbackFn));
  }

  public distinct(): AsyncGenStack<T> {
    return new AsyncGenStack(asyncDistinctGen(this.iterator));
  }

  public distinctBy<U>(callbackFn: AsyncDisinctCallback<T, U>): AsyncGenStack<T> {
    return new AsyncGenStack(asyncDistinctByGen(this.iterator, callbackFn));
  }

  // Mapping
  public map<U>(callbackfn: (value: T) => U | PromiseLike<U>): AsyncGenStack<U> {
    return new AsyncGenStack(asyncMapGen(this.iterator, callbackfn));
  }

  public mapAsync<U>(callbackFn: (value: T) => U | PromiseLike<U>): AsyncGenStack<U> {
    return this.map(callbackFn);
  }

  // Expand
  public flatMap<U>(callbackFn: AsyncFlatMapCallback<T, U>): AsyncGenStack<U> {
    return new AsyncGenStack(asyncFlatMapGen(this.iterator, callbackFn));
  }

  public flatMapAsync<U>(callbackFn: AsyncFlatMapCallback<T, U>): AsyncGenStack<U> {
    return this.flatMap(callbackFn);
  }

  public walker(children: AsyncWalkerChildren<T>): AsyncGenStack<T> {
    return this.flatMap((node) => AsyncGenStack.walker(node, children));
  }

  // Merging
  public merge(...options: AsyncMergeOptions<T>): AsyncGenStack<T> {
    return AsyncGenStack.merge(this, ...options);
  }

  public interlace(...options: AsyncInterlaceOptions<T>): AsyncGenStack<T> {
    return AsyncGenStack.interlace(this, ...options);
  }

  // Utils
  public peek(callbackFn: PeekCallback<T>): AsyncGenStack<T> {
    return new AsyncGenStack(asyncPeekGen(this.iterator, callbackFn));
  }

  // Terminators
  public toArray(): Promise<T[]> {
    return asyncToArray(this);
  }

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

  public reduce(callbackFn: (previous: T, current: T) => T): PromiseLike<T>;
  public reduce<U>(callbackFn: (previous: U, current: T) => U, initialValue: U): PromiseLike<U>;
  public reduce<U = T>(
    callbackFn: (previous: U, current: T) => U,
    initialValue?: U,
  ): PromiseLike<U> {
    return asyncReduce(this.iterator, callbackFn, initialValue);
  }

  public some(
    predicate: (item: T, index: number) => unknown | PromiseLike<unknown>,
  ): PromiseLike<boolean> {
    return asyncSome(this.iterator, predicate);
  }

  public get iterator(): AsyncIterator<T> {
    return this._input;
  }

  // Needed for AsyncIterableIterator interface
  public [Symbol.asyncIterator](): AsyncIterableIterator<T> {
    return this;
  }

  // Needed for AsyncIterableIterator interface
  public next(...args: []): Promise<IteratorResult<T>> {
    return this.iterator.next(...args);
  }

  // Nice things to have
  get [Symbol.toStringTag]() {
    return 'AsyncGenStack';
  }
}
