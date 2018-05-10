import { Binary, Modifier, Unary } from './types';

export type Getter<S, A> = Unary<S, A>;
export type Setter<S, A> = Binary<S, A, S>;

export interface ILens<S, A> {
  get: Getter<S, A>;
  set: Setter<S, A>
}

export function toGetter<S, A>(lens: ILens<S, A>): Unary<S, A> {
  return lens.get;
}

export function view<S, A>(lens: ILens<S, A>): (obj: S) => A;
export function view<S, A>(lens: ILens<S, A>, obj: S): A;
export function view<S, A>(lens: ILens<S, A>, obj?: S): any {
  return arguments.length === 2 ? lens.get(obj)
    : (obj: S) => lens.get(obj);
}

export function over<S, A>(lens: ILens<S, A>, fn: Modifier<A>): (obj: S) => S;
export function over<S, A>(lens: ILens<S, A>, fn: Modifier<A>, obj: S): S;
export function over<S, A>(lens: ILens<S, A>, fn: Modifier<A>, obj?: S): any {
  return arguments.length === 3 ? lens.set(obj, fn(lens.get(obj)))
    : (obj: S) => lens.set(obj, fn(lens.get(obj)));
}

export function set<S, A>(lens: ILens<S, A>, val: A): (obj: S) => S;
export function set<S, A>(lens: ILens<S, A>, val: A, obj: S): S;
export function set<S, A>(lens: ILens<S, A>, val: A, obj?: S): any {
  return arguments.length === 3 ? lens.set(obj, val)
    : (obj: S) => lens.set(obj, val);
}

export function compose<S, A, B>(lensSA: ILens<S, A>, lensAB: ILens<A, B>): ILens<S, B> {
  return {
    get: (obj: S) =>
      lensAB.get(lensSA.get(obj)),
    set: (obj: S, val: B) =>
      lensSA.set(obj, lensAB.set(lensSA.get(obj), val))
  };
}

export namespace Lens {

  function assoc<T, K extends keyof T>(obj: T, key: K, val: T[K]): T {
    return Object.assign({}, obj, { [key]: val });
  }

  function pick<T, K extends keyof T>(keys: K[], obj: T): Pick<T, K> {
    // TODO: better typing?
    return keys.reduce((acc, key) =>
      Object.assign(acc, { [key]: obj[key] }), {}) as Pick<T, K>;
  }

  function partialSet<T, K extends keyof T>(keys: K[], obj: T, val: Pick<T, K>): T {
    // TODO: better typing?
    return keys.reduce((acc, key) =>
      Object.assign(acc, { [key]: val[key] }), Object.assign({}, obj));
  }

  export class LensFactory<T> {
    prop<K extends keyof T>(key: K): ILens<T, T[K]> {
      return {
        get: (obj: T) => obj[key],
        set: (obj: T, val: T[K]) => assoc(obj, key, val)
      };
    }

    pick<K extends keyof T>(keys: K[]): ILens<T, Pick<T, K>> {
      return {
        get: (obj: T) => pick(keys, obj),
        set: (obj: T, val: Pick<T, K>) => partialSet(keys, obj, val)
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
