import Atom from './atom';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/shareReplay';
import { identity } from 'ramda';

interface IStoredAtomOptions<T> {
  key: string;
  from?: (source: any) => T,
  to?: (value: T) => any
}

export default class StoredAtom<T> extends Atom<T> {
  private storedValue$: Observable<T>;

  constructor(defaultValue: T, {key, from = identity, to = identity}: IStoredAtomOptions<T>) {
    const parse = (str: string) => from(JSON.parse(str));
    const serialize = (value: T) => JSON.stringify(to(value));
    const savedItem = localStorage.getItem(key);
    const savedOrDefault = savedItem === null ? defaultValue : parse(savedItem);

    super(savedOrDefault);

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

