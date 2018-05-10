import { Atom } from './atom';
import { IAtom, IStream, Modifier } from './types';
import { compose, ILens, over, view } from './lens';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

export class LensedAtom<T, S> implements IAtom<T>, IStream<T> {

  private subscription: Subscription;

  constructor(private lens: ILens<S, T>, private source: Atom<S>) {
  }

  destroy() {
    this.subscription.unsubscribe();
  }

  alter(fn: Modifier<T>): T {
    return view(this.lens, this.source.alter(over(this.lens, fn)));
  }

  deref(): T {
    return view(this.lens, this.source.deref());
  }

  view<A>(lens: ILens<T, A>): LensedAtom<A, S> {
    const composed: ILens<S, A> = compose(this.lens, lens);
    return new LensedAtom<A, S>(composed, this.source);
  }

  stream(): Observable<T> {
    return this.source.stream().pipe(map(view(this.lens)));
  }
}

