/**
 * Represents the input types that can be converted into a GenStack.
 * Can be an Iterator or an Iterable.
 */
export type GenStackFrom<T> = Iterator<T> | Iterable<T>;

/**
 * Represents the input types that can be converted into an AsyncGenStack.
 * Can be a synchronous or asynchronous Iterator or Iterable.
 */
export type AsyncStackFrom<T> = Iterator<T> | Iterable<T> | AsyncIterator<T> | AsyncIterable<T>;

/**
 * Configuration options for creating a numeric range.
 */
export interface RangeOptions {
  /** The starting number of the range (inclusive). Defaults to 0. */
  start?: number;
  /** The ending number of the range (exclusive). If omitted, the range is infinite. */
  end?: number;
  /** The amount to increment by in each step. Defaults to 1. */
  step?: number;
}

/**
 * Options for merging multiple iterables into one.
 */
export type MergeOptions<T> = (Iterator<T> | Iterable<T>)[];

/**
 * Options for interlacing multiple iterables.
 */
export type InterlaceOptions<T> = (Iterator<T> | Iterable<T>)[];

/**
 * Options for merging multiple async iterables into one.
 */
export type AsyncMergeOptions<T> = (
  | Iterator<T>
  | Iterable<T>
  | AsyncIterator<T>
  | AsyncIterable<T>
)[];

/**
 * Options for interlacing multiple async iterables.
 */
export type AsyncInterlaceOptions<T> = (
  | Iterator<T>
  | Iterable<T>
  | AsyncIterator<T>
  | AsyncIterable<T>
)[];

/**
 * Callback function for mapping a value to an async iterable in a flatMap operation.
 */
export type AsyncFlatMapCallback<T, U> = (
  value: T,
) => Iterator<U> | Iterable<U> | AsyncIterator<U> | AsyncIterable<U>;

/**
 * Callback function for mapping a value to an iterable in a flatMap operation.
 */
export type FlatMapCallback<T, U> = (value: T) => Iterator<U> | Iterable<U>;

/**
 * Callback function to determine the uniqueness of an element.
 */
export type DisinctCallback<T, U> = (value: T) => U;

/**
 * Asynchronous callback function to determine the uniqueness of an element.
 */
export type AsyncDisinctCallback<T, U> = (value: T) => U | PromiseLike<U>;

/**
 * Callback function for peeking at values in the stream without consuming them.
 */
export type PeekCallback<T> = (value: T) => void;

/**
 * Function that returns the children of a node for tree walking.
 */
export type WalkerChildren<T> = (node: T) => Iterable<T> | null | undefined;

/**
 * Function that returns the children of a node for async tree walking.
 */
export type AsyncWalkerChildren<T> = (node: T) => AsyncIterable<T> | Iterable<T> | null | undefined;

/**
 * Type guard predicate function.
 */
export type Predicate<T, S extends T> = (node: T) => node is S;

/**
 * Asynchronous predicate function.
 */
export type AsyncPredicate<T> = (node: T) => unknown | PromiseLike<unknown>;

/**
 * Options for converting a GenStack to a Map.
 */
export interface ToMapOptions<T, K, V> {
  /** Function to extract the key from an item. */
  key?: (i: T) => K;
  /** Function to extract the value from an item. */
  value?: (i: T) => V;
}

/**
 * Options for converting an AsyncGenStack to a Map.
 */
export interface AsyncToMapOptions<T, K, V> {
  /** Function to extract the key from an item. */
  key?: (i: T) => K | PromiseLike<K>;
  /** Function to extract the value from an item. */
  value?: (i: T) => V | PromiseLike<V>;
}
