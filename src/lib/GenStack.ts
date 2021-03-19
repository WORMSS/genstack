import { AsyncGenStack } from './AsyncGenStack';
import { asyncFlatMapGen } from './intermediate/asyncFlatMapGen';
import { asyncMapGen } from './intermediate/asyncMapGen';
import { distinctByGen } from './intermediate/distinctByGen';
import { distinctGen } from './intermediate/distinctGen';
import { filterGen } from './intermediate/filterGen';
import { flatMapGen } from './intermediate/flatMapGen';
import { limitGen } from './intermediate/limitGen';
import { mapGen } from './intermediate/mapGen';
import { peekGen } from './intermediate/peekGen';
import { runUntilGen } from './intermediate/runUntilGen';
import { runWhileGen } from './intermediate/runWhileGen';
import { skipGen } from './intermediate/skipGen';
import { skipUntilGen } from './intermediate/skipUntilGen';
import { skipWhileGen } from './intermediate/skipWhileGen';
import { createRange } from './supplier/createAsyncRange';
import { createGenerator } from './supplier/createGenerator';
import { createInterlace } from './supplier/createInterlace';
import { createMerge } from './supplier/createMerge';
import {
  AsyncFlatMapCallback,
  DisinctCallback,
  FlatMapCallback,
  GenStackFrom,
  InterlaceOptions,
  MergeOptions,
  PeekCallback,
  RangeOptions,
} from './types';
import { getIterator } from './utils/getIterator';

export class GenStack<T> implements IterableIterator<T> {
  private readonly _input: Iterator<T>;

  public static from<T>(input: GenStackFrom<T>): GenStack<T> {
    return new GenStack(getIterator(input));
  }

  public static generate<T>(generator: () => T): GenStack<T> {
    return new GenStack(createGenerator(generator));
  }

  public static range(options?: RangeOptions): GenStack<number> {
    return new GenStack(createRange(options));
  }

  public static merge<T>(...options: MergeOptions<T>): GenStack<T> {
    return new GenStack(createMerge(...options));
  }

  public static interlace<T>(...options: InterlaceOptions<T>): GenStack<T> {
    return new GenStack(createInterlace(...options));
  }

  constructor(input: Iterator<T>) {
    this._input = input;
  }

  public limit(num: number): GenStack<T> {
    return new GenStack(limitGen(this.iterator, num));
  }

  public filter(predicate: (value: T) => boolean): GenStack<T> {
    return new GenStack(filterGen(this.iterator, predicate));
  }

  public map<U>(callbackfn: (value: T) => U): GenStack<U> {
    return new GenStack(mapGen(this.iterator, callbackfn));
  }

  public mapAsync<U>(callbackFn: (value: T) => U | PromiseLike<U>): AsyncGenStack<U> {
    return new AsyncGenStack(asyncMapGen(this.iterator, callbackFn));
  }

  public distinct(): GenStack<T> {
    return new GenStack(distinctGen(this.iterator));
  }

  public distinctBy<U>(callbackFn: DisinctCallback<T, U>): GenStack<T> {
    return new GenStack(distinctByGen(this.iterator, callbackFn));
  }

  public flatMap<U>(callbackFn: FlatMapCallback<T, U>): GenStack<U> {
    return new GenStack(flatMapGen(this.iterator, callbackFn));
  }

  public flatMapAsync<U>(callbackFn: AsyncFlatMapCallback<T, U>): AsyncGenStack<U> {
    return new AsyncGenStack(asyncFlatMapGen(this.iterator, callbackFn));
  }

  public skip(skip: number): GenStack<T> {
    return new GenStack(skipGen(this.iterator, skip));
  }

  public peek(callbackFn: PeekCallback<T>): GenStack<T> {
    return new GenStack(peekGen(this.iterator, callbackFn));
  }

  public skipWhile(callbackFn: (value: T) => boolean): GenStack<T> {
    return new GenStack(skipWhileGen(this.iterator, callbackFn));
  }

  public skipUntil(callbackFn: (value: T) => boolean): GenStack<T> {
    return new GenStack(skipUntilGen(this.iterator, callbackFn));
  }

  public runWhile(callbackFn: (value: T) => boolean): GenStack<T> {
    return new GenStack(runWhileGen(this.iterator, callbackFn));
  }

  public runUntil(callbackFn: (value: T) => boolean): GenStack<T> {
    return new GenStack(runUntilGen(this.iterator, callbackFn));
  }

  public merge(...options: MergeOptions<T>): GenStack<T> {
    return GenStack.merge(this, ...options);
  }

  public interlace(...options: InterlaceOptions<T>): GenStack<T> {
    return GenStack.interlace(this, ...options);
  }

  public toArray(): T[] {
    return [...this];
  }

  public get iterator(): Iterator<T> {
    return this._input;
  }

  // Needed for IterableIterator interface
  public [Symbol.iterator](): GenStack<T> {
    return this;
  }

  // Needed for IterableIterator interface
  public next(...args: []): IteratorResult<T> {
    return this.iterator.next(...args);
  }
}
