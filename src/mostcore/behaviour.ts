import { Binary, Dynamic, IRef, Quaternary, Quinary, Ternary, Unary, Variadic } from './types';
import { Disposable, Scheduler, Sink, Stream } from '@most/types';
import { combineArray, map, switchLatest } from '@most/core';
import observe from './observe';

export class Behaviour<T> implements IRef<T>, Stream<T> {

  run(sink: Sink<T>, scheduler: Scheduler): Disposable {
    return this.source.run(sink, scheduler);
  }

  constructor(private value: T, private source: Stream<T>) {
    observe(this.keepValue, this);
  }

  keepValue(value: T) {
    this.value = value;
  }

  deref(): T {
    return this.value;
  }

  static of<T>(source: Dynamic<T>): Behaviour<T> {
    return new Behaviour(
      source.deref(),
      source
    );
  }

  map<S>(f: Unary<T, S>): Behaviour<S> {
    return new Behaviour(
      f(this.value),
      map(f, this.source)
    );
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
      combineArray(f, [this.source, ...refs]))
  }

  switch<S>(f: Unary<T, Dynamic<S>>): Behaviour<S> {
    return new Behaviour(
      f(this.value).deref(),
      switchLatest(map(f, this.source))
    );
  }

}
