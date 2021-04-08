import { assert } from 'chai';
import { AsyncGenStack } from '../src/lib/AsyncGenStack';
import { GenStack } from '../src/lib/GenStack';

describe('Interop', () => {
  it('should have the same static methods on both AsyncGenStack and GenStack', () => {
    assert.sameOrderedMembers(
      getStaticPropertyNames(GenStack),
      getStaticPropertyNames(AsyncGenStack),
    );
  });

  it('should have the same functions on both AsyncGenStack and GenStack', () => {
    assert.sameOrderedMembers(
      getAllPropertyNames(GenStack.prototype),
      getAllPropertyNames(AsyncGenStack.prototype),
    );
  });

  function getStaticPropertyNames(obj: any): string[] {
    return [
      ...deleteAll(
        addAll(new Set<string>(), ...Object.getOwnPropertyNames(obj)),
        ...Object.getOwnPropertyNames(Function.prototype),
        'prototype',
      ),
    ];
  }

  function getAllPropertyNames(obj: any): string[] {
    const props = new Set<string>();
    do {
      addAll(props, ...Object.getOwnPropertyNames(obj));
    } while ((obj = Object.getPrototypeOf(obj)));

    return [...deleteAll(props, ...Object.getOwnPropertyNames(Object.prototype))];
  }

  function addAll<T>(set: Set<T>, ...thingsToAdd: T[]): Set<T> {
    for (const toAdd of thingsToAdd) set.add(toAdd);
    return set;
  }

  function deleteAll<T>(set: Set<T>, ...thingsToDelete: T[]): Set<T> {
    for (const toDelete of thingsToDelete) set.delete(toDelete);
    return set;
  }
});
