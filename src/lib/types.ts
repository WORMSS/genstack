export type GenStackFrom<T> = Iterator<T> | Iterable<T>;
export type AsyncStackFrom<T> = Iterator<T> | Iterable<T> | AsyncIterator<T> | AsyncIterable<T>;
export interface RangeOptions {
  start?: number;
  end?: number;
  step?: number;
}
export type MergeOptions<T> = (Iterator<T> | Iterable<T>)[];
export type InterlaceOptions<T> = (Iterator<T> | Iterable<T>)[];
export type AsyncMergeOptions<T> = (
  | Iterator<T>
  | Iterable<T>
  | AsyncIterator<T>
  | AsyncIterable<T>
)[];
export type AsyncInterlaceOptions<T> = (
  | Iterator<T>
  | Iterable<T>
  | AsyncIterator<T>
  | AsyncIterable<T>
)[];
export type AsyncFlatMapCallback<T, U> = (
  value: T,
) => Iterator<U> | Iterable<U> | AsyncIterator<U> | AsyncIterable<U>;
export type FlatMapCallback<T, U> = (value: T) => Iterator<U> | Iterable<U>;
export type DisinctCallback<T, U> = (value: T) => U;
export type AsyncDisinctCallback<T, U> = (value: T) => U | PromiseLike<U>;
export type PeekCallback<T> = (value: T) => void;
export type WalkerChildren<T> = (node: T) => Iterable<T> | null | undefined;
export type AsyncWalkerChildren<T> = (node: T) => AsyncIterable<T> | Iterable<T> | null | undefined;
export type Predicate<T, S extends T> = (node: T) => node is S;
export type AsyncPredicate<T> = (node: T) => unknown | PromiseLike<unknown>;
