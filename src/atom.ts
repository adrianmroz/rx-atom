import { IAtom, IStream, Modifier, Unary } from './types';
import { LensedAtom } from './lensed-atom';
import { ILens } from './lens';
import { Observable, Subject } from 'rxjs';

export class Atom<T> implements IAtom<T>, IStream<T> {

  private value$ = new Subject<T>();

  constructor(private value: T) {
  }

  destroy() {
    this.value$.complete();
  }

  alter(fn: Modifier<T>): T {
    const value = fn(this.value);
    this.value = value;
    this.value$.next(value);
    return value;
  }

  deref(): T {
    return this.value;
  }

  view<A>(lens: ILens<T, A>): LensedAtom<A, T> {
    return new LensedAtom<A, T>(lens, this);
  }

  stream(): Observable<T> {
    return this.value$.asObservable();
  }
}

export class StoredAtom<T> extends Atom<T> {
  constructor(defaultValue: T, private key: string) {
    super(JSON.parse(localStorage.getItem(key)) || defaultValue);
    this.stream().subscribe(value => {
      localStorage.setItem(key, JSON.stringify(value));
    });
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
