import { Atom } from './atom';
import { IAtom, Modifier } from './types';
import { compose, ILens, over, view } from '../lens';
import { Disposable, Scheduler, Sink, Stream, Time } from '@most/types';

export class LensedAtom<T, S> implements IAtom<T>, Stream<T> {

  constructor(private lens: ILens<S, T>, private source: Atom<S>) {
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

  run(sink: Sink<T>, scheduler: Scheduler): Disposable {
    return this.source.run(new ViewPipe(sink, this.lens), scheduler);
  }
}

class ViewPipe<T, S> implements Sink<S> {

  constructor(private sink: Sink<T>, private lens: ILens<S, T>) {
  }

  event(time: Time, value: S): void {
    this.sink.event(time, view(this.lens, value));
  }

  end(time: Time): void {
    this.sink.end(time);
  }

  error(time: Time, err: Error): void {
    this.sink.error(time, err);
  }
}

