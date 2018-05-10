import { ImmutableObject } from 'seamless-immutable';
import { Getter, ILens, Setter } from './lens';

export namespace ImmutableLens {

  function pick<T, K extends keyof T>(keys: K[], obj: ImmutableObject<T>): ImmutableObject<Pick<T, K>> {
    // TODO: some type magic
    return obj.without((val, key: K) =>
      keys.indexOf(key) === -1
    ) as any as ImmutableObject<Pick<T, K>>;
  }

  function partialSet<T, K extends keyof T>(keys: K[], obj: ImmutableObject<T>, val: Pick<T, K>): ImmutableObject<T> {
    return keys.reduce((acc, key) => acc.set(key, val[key]), obj);
  }

  export class LensFactory<T> {

    prop<K extends keyof T>(key: K): ILens<ImmutableObject<T>, T[K]> {
      return {
        get: (obj: ImmutableObject<T>) => obj[key],
        set: (obj: ImmutableObject<T>, val: T[K]) => obj.set(key, val)
      };
    }

    pick<K extends keyof T>(keys: K[]): ILens<ImmutableObject<T>, ImmutableObject<Pick<T, K>>> {
      return {
        get: (obj: ImmutableObject<T>) => pick(keys, obj),
        set: (obj: ImmutableObject<T>, val: Pick<T, K>) => partialSet(keys, obj, val)
      };
    }
  }

  export function of<S>() {
    return new LensFactory<S>();
  }

  export function from<S, A>(get: Getter<S, A>, set: Setter<S, A>): ILens<S, A> {
    return { get, set };
  }
}