import { asyncDistinctByGen } from './intermediate/asyncDistinctByGen';
import { asyncDistinctGen } from './intermediate/asyncDistinctGen';
import { asyncFilterGen } from './intermediate/asyncFilterGen';
import { asyncFlatMapGen } from './intermediate/asyncFlatMapGen';
import { asyncLimitGen } from './intermediate/asyncLimitGen';
import { asyncMapGen } from './intermediate/asyncMapGen';
import { asyncPeekGen } from './intermediate/asyncPeekGen';
import { asyncRunUntilGen } from './intermediate/asyncRunUntilGen';
import { asyncRunWhileGen } from './intermediate/asyncRunWhileGen';
import { asyncSkipGen } from './intermediate/asyncSkipGen';
import { asyncSkipUntilGen } from './intermediate/asyncSkipUntilGen';
import { asyncSkipWhileGen } from './intermediate/asyncSkipWhileGen';
import { createAsyncGenerator } from './supplier/createAsyncGenerator';
import { createAsyncInterlace } from './supplier/createAsyncInterlace';
import { createAsyncMerge } from './supplier/createAsyncMerge';
import { createRange } from './supplier/createAsyncRange';
import { createAsyncWalker } from './supplier/createAsyncWalker';
import {
  AsyncDisinctCallback,
  AsyncFlatMapCallback,
  AsyncInterlaceOptions,
  AsyncMergeOptions,
  AsyncPredicate,
  AsyncStackFrom,
  AsyncWalkerChildren,
  PeekCallback,
  Predicate,
  RangeOptions,
} from './types';
import { asyncToArray } from './utils/asyncToArray';
import { filterNull } from './utils/filterNull';
import { filterNullUndefined } from './utils/filterNullUndefined';
import { filterUndefined } from './utils/filterUndefined';
import { getAsyncIterator } from './utils/getAsyncIterator';
import { wrapToAsyncIterator } from './utils/wrapToAsyncIterator';

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
