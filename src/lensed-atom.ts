import Atom from './atom';
import { IAtom, Modifier, Projection } from './types';
import { Observable } from 'rxjs/Observable';
import { over, view, compose } from 'ramda';
import { Lens } from '@types/ramda';

export default class LensedAtom<T, S> implements IAtom<T> {
  constructor(private lens: Lens, private source: Atom<S>) {
  }

  get(): Observable<T> {
    return this.source.project(view(this.lens));
  }

  modify(fn: Modifier<T>): void {
    this.source.modify(over(this.lens, fn));
  }

  project<R>(projection: Projection<T, R>): Observable<R> {
    return this.source.project((x: S) => projection(view(this.lens, x) as T));
  }

  view<A>(lens: Lens): LensedAtom<A, S> {
    return new LensedAtom(compose(this.lens, lens) as Lens, this.source);
  }
}

