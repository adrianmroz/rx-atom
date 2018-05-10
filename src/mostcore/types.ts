import { Stream } from '@most/types';

export type Unary<A, R> = (a: A) => R;
export type Binary<A, B, R> = (a: A, b: B) => R;
export type Ternary<A, B, C, R> = (a: A, b: B, c: C) => R;
export type Quaternary<A, B, C, D, R> = (a: A, b: B, c: C, d: D) => R;
export type Quinary<A, B, C, D, E, R> = (a: A, b: B, c: C, d: D, e: E) => R;

export type Variadic<T, R> = (...xs: T[]) => R;

export type Modifier<T> = Unary<T, T>;

export interface IRef<T> {
  deref(): T;
}

export interface IAtom<T> extends IRef<T> {
  alter(fn: Modifier<T>): T;
}

export class Reference<T> implements IRef<T> {
  constructor(private value: T) {
  }

  deref(): T {
    return this.value;
  }
}

export type Dynamic<T> = IRef<T> & Stream<T>;
