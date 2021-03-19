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
import {
  AsyncDisinctCallback,
  AsyncInterlaceOptions,
  AsyncMergeOptions,
  AsyncStackFrom,
  PeekCallback,
  RangeOptions,
} from './types';
import { asyncToArray } from './utils/asyncToArray';
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

  constructor(input: AsyncIterator<T>) {
    this._input = input;
  }

  public limit(num: number): AsyncGenStack<T> {
    return new AsyncGenStack(asyncLimitGen(this.iterator, num));
  }

  public filter(predicate: (value: T) => boolean | PromiseLike<boolean>): AsyncGenStack<T> {
    return new AsyncGenStack(asyncFilterGen(this.iterator, predicate));
  }

  public map<U>(callbackfn: (value: T) => U | PromiseLike<U>): AsyncGenStack<U> {
    return new AsyncGenStack(asyncMapGen(this.iterator, callbackfn));
  }

  public distinct(): AsyncGenStack<T> {
    return new AsyncGenStack(asyncDistinctGen(this.iterator));
  }

  public distinctBy<U>(callbackFn: AsyncDisinctCallback<T, U>): AsyncGenStack<T> {
    return new AsyncGenStack(asyncDistinctByGen(this.iterator, callbackFn));
  }

  public flatMap<U>(callbackFn: (value: T) => Iterable<U> | AsyncIterable<U>): AsyncGenStack<U> {
    return new AsyncGenStack(asyncFlatMapGen(this.iterator, callbackFn));
  }

  public skip(skip: number): AsyncGenStack<T> {
    return new AsyncGenStack(asyncSkipGen(this.iterator, skip));
  }

  public peek(callbackFn: PeekCallback<T>): AsyncGenStack<T> {
    return new AsyncGenStack(asyncPeekGen(this.iterator, callbackFn));
  }

  public skipWhile(callbackFn: (value: T) => boolean): AsyncGenStack<T> {
    return new AsyncGenStack(asyncSkipWhileGen(this.iterator, callbackFn));
  }

  public skipUntil(callbackFn: (value: T) => boolean): AsyncGenStack<T> {
    return new AsyncGenStack(asyncSkipUntilGen(this.iterator, callbackFn));
  }

  public runWhile(callbackFn: (value: T) => boolean): AsyncGenStack<T> {
    return new AsyncGenStack(asyncRunWhileGen(this.iterator, callbackFn));
  }

  public runUntil(callbackFn: (value: T) => boolean): AsyncGenStack<T> {
    return new AsyncGenStack(asyncRunUntilGen(this.iterator, callbackFn));
  }

  public merge(...options: AsyncMergeOptions<T>): AsyncGenStack<T> {
    return AsyncGenStack.merge(this, ...options);
  }

  public interlace(...options: AsyncInterlaceOptions<T>): AsyncGenStack<T> {
    return AsyncGenStack.interlace(this, ...options);
  }

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
}
