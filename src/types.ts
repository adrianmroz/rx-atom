import { Observable } from 'rxjs/Observable';
import LensedAtom from './lensed-atom';

export interface Lens {
  <T, U>(obj: T): U;
  set<T, U>(str: string, obj: T): U;
}

export type Projection<T, R> = (source: T) => R;
export type Modifier<T> = (value: T) => T;

export interface IAtom<T> {
  get(): Observable<T>;
  modify(fn: Modifier<T>): void;
  project<R>(projection: Projection<T, R>): Observable<R>;
}

export interface IViewable<S> {
  view<T>(lens: Lens): LensedAtom<T, S>;
}

