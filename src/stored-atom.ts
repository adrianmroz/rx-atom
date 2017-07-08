import Atom from './atom';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/shareReplay';
import { identity } from 'ramda';

export type From = <T>(source: any) => T;
export type To = <T>(value: T) => any;

const defaultFrom: From = identity;
const defaultTo: To = identity;

export interface IStoredAtomOptions<T> {
  key: string;
  from?: From,
  to?: To
}

export default class StoredAtom<T> extends Atom<T> {
  private storedValue$: Observable<T>;

  constructor(defaultValue: T, {key, from = defaultFrom, to = defaultTo}: IStoredAtomOptions<T>) {
    const parse = (str: string) => from(JSON.parse(str));
    const serialize = (value: T) => JSON.stringify(to(value));
    const savedItem = localStorage.getItem(key);
    const savedOrDefault = savedItem === null ? defaultValue : parse(savedItem);

    super(savedOrDefault as T);

    this.storedValue$ = this.value$
      .do((value: T) => {
        localStorage.setItem(key, serialize(value));
      })
      .shareReplay(1);
  }

  get(): Observable<T> {
    return this.storedValue$;
  }
}

