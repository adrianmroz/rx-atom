import { IAtom, Modifier, Projection } from './types';
import LensedAtom from './lensed-atom';
import { Lens } from '@types/ramda';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { ConnectableObservable } from 'rxjs/observable/ConnectableObservable';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/operator/map';

export default class Atom<T> implements IAtom<T> {
  private actions$: Subject<Modifier<T>> = new Subject<Modifier<T>>();
  protected value$: ConnectableObservable<T>;
  private sub: Subscription;

  constructor(init: T) {
    this.value$ = this.actions$
      .scan((value: T, fn: Modifier<T>) => fn(value), init)
      .startWith(init)
      .distinctUntilChanged()
      .publishReplay(1);
    this.sub = this.value$.connect();
  }

  get(): Observable<T> {
    return this.value$;
  }

  modify(fn: Modifier<T>): void {
    this.actions$.next(fn);
  }

  project<R>(projection: Projection<T, R>): Observable<R> {
    return this.get().map(projection).distinctUntilChanged();
  }

  view<S>(lens: Lens): LensedAtom<S, T> {
    return new LensedAtom(lens, this);
  }
}
