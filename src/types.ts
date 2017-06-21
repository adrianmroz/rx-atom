import { Observable } from 'rxjs/Observable';
import { Lens } from '@types/ramda';
import LensedAtom from './lensed-atom';

export type Projection<T, R> = (source: T) => R;
export type Modifier<T> = (value: T) => T;

export interface IAtom<T> {
  get(): Observable<T>;
  modify(fn: Modifier<T>): void;
  project<R>(projection: Projection<T, R>): Observable<R>;
  view<S, A>(lens: Lens): LensedAtom<S, A>;
}

