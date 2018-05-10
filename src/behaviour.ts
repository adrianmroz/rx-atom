import { Binary, Dynamic, IRef, IStream, Variadic, Quaternary, Quinary, Ternary, Unary } from './types';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { switchMap } from 'rxjs/internal/operators';

export class Behaviour<T> implements IRef<T>, IStream<T> {

  private subscription: Subscription;

  constructor(private value: T, private source: Observable<T>) {
    this.subscription = this.source.subscribe(value => {
      this.value = value;
    });
  }

  destroy() {
    this.subscription.unsubscribe();
  }

  deref(): T {
    return this.value;
  }

  static of<T>(source: Dynamic<T>): Behaviour<T> {
    return new Behaviour(source.deref(), source.stream());
  }

  map<S>(f: Unary<T, S>): Behaviour<S> {
    return new Behaviour(f(this.value), this.source.pipe(map(f)));
  }

  combine<B, R>(b: Dynamic<B>, f: Binary<T, B, R>): Behaviour<R>;
  combine<B, C, R>(b: Dynamic<B>, c: Dynamic<C>, f: Ternary<T, B, C, R>): Behaviour<R>;
  combine<B, C, D, R>(b: Dynamic<B>,c: Dynamic<C>, d: Dynamic<D>, f: Quaternary<T, B, C, D, R>): Behaviour<R>;
  combine<B, C, D, E, R>(b: Dynamic<B>,c: Dynamic<C>,  d: Dynamic<D>, e: Dynamic<E>, f: Quinary<T, B, C, D, E, R>): Behaviour<R>;
  combine<R>(...xs: Array<Dynamic<any> | Variadic<any, R>>): Behaviour<R> {
    const refs = xs.slice(0, -1) as Array<Dynamic<any>>;
    const f = xs[xs.length - 1] as Variadic<any, R>;
    return new Behaviour(
      f(this.value, ...refs.map(ref => ref.deref())),
      combineLatest([this.source, ...refs.map(ref => ref.stream())])
        .pipe(map(vals => f(...vals))));
  }

  switch<S>(f: Unary<T, Dynamic<S>>): Behaviour<S> {
    return new Behaviour(
      f(this.value).deref(),
      this.source.pipe(switchMap(val => f(val).stream())));
  }

  stream(): Observable<T> {
    return this.source;
  }
}
