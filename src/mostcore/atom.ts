import { IAtom, Modifier, Unary } from './types';
import { LensedAtom } from './lensed-atom';
import { ILens } from '../lens';
import { Disposable, Scheduler, Sink, Stream } from '@most/types';
import { currentTime } from '@most/scheduler';
import observe from './observe';

export class Atom<T> implements IAtom<T>, Stream<T> {

  private listeners = new Map<Object, Unary<T, void>>();

  constructor(private value: T) {
  }

  alter(fn: Modifier<T>): T {
    const value = fn(this.value);
    this.value = value;
    this.notify(value);
    return value;
  }

  deref(): T {
    return this.value;
  }

  view<A>(lens: ILens<T, A>): LensedAtom<A, T> {
    return new LensedAtom<A, T>(lens, this);
  }

  run(sink: Sink<T>, scheduler: Scheduler): Disposable {

    const send = function (value: T) {
      sink.event(currentTime(scheduler), value);
    };

    const key = {};
    this.listeners.set(key, send);
    const dispose = () => this.listeners.delete(key);

    return { dispose };
  }

  private notify(value: T) {
    this.listeners.forEach((cb: Unary<T, void>) => {
      cb(value);
    });
  }
}

export class StoredAtom<T> extends Atom<T> {
  constructor(defaultValue: T, private key: string) {
    super(JSON.parse(localStorage.getItem(key) as string) || defaultValue);
    observe(this.storeValue, this);
  }

  storeValue(value: T) {
    localStorage.setItem(this.key, JSON.stringify(value));
  }
}

export class ConstrainedAtom<T> extends Atom<T | Error> {
  constructor(value: T, private validator: Unary<T | Error, boolean>) {
    super(validator(value) ? value : new Error());
  }

  alter(fn: Modifier<T | Error>): T | Error {
    return super.alter(oldValue => {
      const newValue = fn(oldValue);
      const valid = this.validator(newValue);
      return valid ? newValue : new Error();
    });
  }
}
