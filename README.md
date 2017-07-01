# rx-atom

Reactive atom implementation in ReactiveExtensions.js. Uses Ramda compatible lenses to decompose state.



## Why

Atoms provide identifier or handler to reference values changing in time. When using immutable values you separate identity and state. Atoms enable to bring those back into one place in sane way.



This implementation of atoms provide reactive interface to observe changes. Method `get` returns `Observable` from ReactiveExtensions.js library.



Atom also provides `view` method, which given `Lens` returns `LensedAtom`. It is a bidirectional projection of parent Atom. Meaning that, it gives access only to part of parent Atom (thanks to used `Lens`) and guarantees consistency with it.



## Getting started

```typescript
import { Atom } from 'rx-atom';

const counter = new Atom(0);

counter.get().subscribe(count => {
  console.log('Current count: ', count);
});
// logs initial value of 0

function inc() {
  counter.modify((count) => count + 1);
}

inc();
// logs modified value of 1
```

This is simplest usage of Atom. You can create new Atom with initial value. Method `get` returns `Observable` of values in this Atom. This observable emits new value on every change of Atom internal value. In this example we just `subscribe` to this `Observable` and log it's value to console. In `inc` function we modify value of Atom using method `modify`. 

## Lenses and LensedAtom

```typescript
import { Atom } from 'rx-atom';
import { propLens } from 'ramda';

const state = new Atom({count: 0, name: ''});

state.get().subscribe(state => {
  console.log('debug state: ', state);
});

function nameWidget(name) {
  name.get().subscribe(name => {
    document.getElementById('name-label').textContent = name;
  });
  
  document.getElementById('name-input').addEventListener('change', function() {
  	name.set(this.value);
  });
}

const nameLens = propLens('name');
nameWidget(state.view(nameLens));
```

This example show how we can decompose state into smaller chunks and still have consistency and reactive nature. First, we declare global state for whole application. We also subscribe to it to provide logs for debuging. Then we define simple component which accepts Atom with string value. It is just input and text label that are synchronized. When something changes in input field, the label should reflect that change. 



We define `Lens` that picks just `name` property from object. Then we use it in `view` method on state Atom. This atom we can pass to `nameWidget`. Component doesn't know how whole state looks, it gets only value viewed through `nameLens` (e.g. only `name` property). Component can modify it's value and this change will be reflected in underlying state Atom. And all subscribers to state Atom will see these changes. Because values flow down and changes start always on top, and because of nature of Observables, whole state is always consistent. If we wan't to introduce circular dependencies, we must explicity add modification of Atom inside subscription, and that's easy to spot and is considered bad practice.



## How LensedAtoms works?

Each LensedAtom holds reference to parent Atom and `Lens` which was used to create it. In that way, `Observable` from `get` is just value of parent Atom mapped with `Lens`. Every modification of LensedAtoms is really modification of parent Atom through `Lens` This way LensedAtom doesn't really hold any value and is just projection of parent Atom. When calling `view` on LensedAtom, the resulting LensedAtom holds reference to original parent and `Lens` is just composition of `Lens` from parent and itself. 



## StoredAtom

This library provides also StoredAtom flavour. This Atom's values are stored in LocalStorage on every change, and if value exist in LocalStorage upon Atom creation - it's used as initial value.

```typescript
import { StoredAtom } from 'rx-atom';

const atom = new StoredAtom('default value', {key: 'local-storage-key'});
```

This Atom's values will be stored under `local-storage-key`, and if some value existed here, it will be used instead `default value`.

Stored atom also accepts options `to` and `from` which are used to serialize and deserialize value to LocalStorage. That way it's possible to store only essential part of state.



## Prior art

This library is heavly influenced by [calmm-js](https://github.com/calmm-js).













