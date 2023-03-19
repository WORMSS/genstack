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
import { createGenerator } from './supplier/createGenerator';
import { createInterlace } from './supplier/createInterlace';
import { createMerge } from './supplier/createMerge';
import { createRange } from './supplier/createRange';
import { createReg } from './supplier/createReg';
import { createWalker } from './supplier/createWalker';
import {
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
} from './types';
import { filterNull } from './utils/filterNull';
import { filterNullUndefined } from './utils/filterNullUndefined';
import { filterUndefined } from './utils/filterUndefined';
import { getIterator } from './utils/getIterator';
import { toMap } from './utils/toMap';

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

  public static walker<T>(node: T, children: WalkerChildren<T>): GenStack<T> {
    return new GenStack(createWalker(node, children));
  }

  public static reg(reg: string | RegExp, content: string): GenStack<RegExpMatchArray> {
    return new GenStack(createReg(reg, content));
  }

  constructor(input: Iterator<T>) {
    this._input = input;
  }

  // Limits
  public limit(num: number): GenStack<T> {
    return new GenStack(limitGen(this.iterator, num));
  }

  public runWhile(callbackFn: (value: T) => boolean): GenStack<T> {
    return new GenStack(runWhileGen(this.iterator, callbackFn));
  }

  public runUntil(callbackFn: (value: T) => boolean): GenStack<T> {
    return new GenStack(runUntilGen(this.iterator, callbackFn));
  }

  public filter<S extends T>(predicate: Predicate<T, S>): GenStack<S>; // The good filter
  public filter(predicate: (n: T) => unknown): GenStack<T>; // The fall back filter
  public filter(predicate: (n: T) => unknown): GenStack<T> {
    return new GenStack(filterGen(this.iterator, predicate));
  }

  public filterNull(): GenStack<Exclude<T, null>> {
    return this.filter(filterNull);
  }

  public filterUndefined(): GenStack<Exclude<T, undefined>> {
    return this.filter(filterUndefined);
  }

  public filterNullUndefined(): GenStack<Exclude<T, null | undefined>> {
    return this.filter(filterNullUndefined);
  }

  public skip(skip: number): GenStack<T> {
    return new GenStack(skipGen(this.iterator, skip));
  }

  public skipWhile(callbackFn: (value: T) => boolean): GenStack<T> {
    return new GenStack(skipWhileGen(this.iterator, callbackFn));
  }

  public skipUntil(callbackFn: (value: T) => boolean): GenStack<T> {
    return new GenStack(skipUntilGen(this.iterator, callbackFn));
  }

  public distinct(): GenStack<T> {
    return new GenStack(distinctGen(this.iterator));
  }

  public distinctBy<U>(callbackFn: DisinctCallback<T, U>): GenStack<T> {
    return new GenStack(distinctByGen(this.iterator, callbackFn));
  }

  // Mapping
  public map<U>(callbackfn: (value: T) => U): GenStack<U> {
    return new GenStack(mapGen(this.iterator, callbackfn));
  }

  public mapAsync<U>(callbackFn: (value: T) => U | PromiseLike<U>): AsyncGenStack<U> {
    return new AsyncGenStack(asyncMapGen(this.iterator, callbackFn));
  }

  // Expand
  public flatMap<U>(callbackFn: FlatMapCallback<T, U>): GenStack<U> {
    return new GenStack(flatMapGen(this.iterator, callbackFn));
  }

  public flatMapAsync<U>(callbackFn: AsyncFlatMapCallback<T, U>): AsyncGenStack<U> {
    return new AsyncGenStack(asyncFlatMapGen(this.iterator, callbackFn));
  }

  public walker(children: WalkerChildren<T>): GenStack<T> {
    return this.flatMap((node) => GenStack.walker(node, children));
  }

  // Merging
  public merge(...options: MergeOptions<T>): GenStack<T> {
    return GenStack.merge(this, ...options);
  }

  public interlace(...options: InterlaceOptions<T>): GenStack<T> {
    return GenStack.interlace(this, ...options);
  }

  // Utils
  public peek(callbackFn: PeekCallback<T>): GenStack<T> {
    return new GenStack(peekGen(this.iterator, callbackFn));
  }

  // Terminators
  public toArray(): T[] {
    return [...this];
  }

  public toMap<K, V>(options?: ToMapOptions<T, K, V>): Map<K, V>;
  public toMap<K, V>(key?: (i: T) => K, value?: (i: T) => V): Map<K, V>;
  public toMap<K, V>(
    keyOrOptions?: ToMapOptions<T, K, V> | ((i: T) => K),
    value?: (i: T) => V,
  ): Map<K, V> {
    return toMap(this.iterator, keyOrOptions, value);
  }

  // Incase someone doesn't understand how this works
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

  // Nice things to have
  get [Symbol.toStringTag]() {
    return 'GenStack';
  }
}
