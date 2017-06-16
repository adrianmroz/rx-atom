import { Observable, Subject, ConnectableObservable, Subscription } from 'rxjs';
import { over, view, compose } from 'ramda';
import { Lens} from '@types/ramda';

type Modifier<T> = (value: T) => T;
type Projection<T, R> = (source: T) => R;

interface IAtom<T> {
  get(): Observable<T>;
  modify(fn: Modifier<T>): void;
  project<R>(projection: Projection<T, R>): Observable<R>;
  view<S, A>(lens: Lens): LensedAtom<S, A>;
}

class Atom<T> implements IAtom<T> {

  private actions$: Subject<Modifier<T>> = new Subject<Modifier<T>>();
  private value$: ConnectableObservable<T>;
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

  modify(fn: Modifier<T>):void {
    this.actions$.next(fn);
  }

  project<R>(projection: Projection<T, R>):Observable<R> {
    return this.value$.map(projection).distinctUntilChanged();
  }

  view<S>(lens:Lens):LensedAtom<S, T> {
    return new LensedAtom(lens, this);
  }
}

class LensedAtom<T, S> implements IAtom<T> {

  constructor(private lens: Lens, private source: Atom<S>) {}

  get():Observable<T> {
    return this.source.project(view(this.lens));
  }

  modify(fn:Modifier<T>):void {
    this.source.modify(over(this.lens, fn));
  }

  project<R>(projection:Projection<T, R>):Observable<R> {
    return this.source.project((x: S) => projection(view(this.lens, x) as T));
  }

  view<A>(lens:Lens):LensedAtom<A, S> {
    return new LensedAtom(compose(this.lens, lens) as Lens, this.source);
  }
}

// repl
import {lensProp} from 'ramda';
const aAtom = new Atom({x: 6});
aAtom.get().subscribe(a => console.log('a', a));
aAtom.modify(o => ({x: 12}));

const lens: Lens = lensProp('x');

const xAtom = aAtom.view<number>(lens);

xAtom.get().subscribe(x => console.log('x', x));

xAtom.modify(x => x + 1);
debugger;
