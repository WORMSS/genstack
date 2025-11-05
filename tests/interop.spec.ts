import { AsyncGenStack } from '../src/lib/AsyncGenStack.ts';
import { GenStack } from '../src/lib/GenStack.ts';
import { expect, it } from 'vitest';

it('should have the same static methods on both AsyncGenStack and GenStack', () => {
  const genstack = props(GenStack);
  const asyncgenstack = props(AsyncGenStack);

  expect(genstack).toStrictEqual(asyncgenstack);
});

it('should have the same functions on both AsyncGenStack and GenStack', () => {
  const genstack = props(GenStack.prototype);
  const asyncgenstack = props(AsyncGenStack.prototype);

  expect(genstack).toStrictEqual(asyncgenstack);
});

function props(obj: any): string[] {
  const filterOut = [
    'prototype',
    ...Object.getOwnPropertyNames(Function.prototype),
    ...Object.getOwnPropertyNames(Object.prototype),
  ];
  return Object.getOwnPropertyNames(obj).filter((v) => !filterOut.includes(v));
}
