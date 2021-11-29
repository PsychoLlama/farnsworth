import assert from '../assert';

describe('assert', () => {
  it.each([
    ['null', null],
    ['false', false],
    ['undefined', undefined],
    ['NaN', NaN],
    ['zero', 0],
    ['empty string', ''],
  ])('throws if the value is %s', (_, value) => {
    const fail = () => assert(value, 'Testing falsy values');

    expect(fail).toThrow('Testing falsy values');
  });

  it.each([
    ['true', true],
    ['non-empty string', 'hello'],
    ['non-zero integer', -1],
    ['object', {}],
    ['array', []],
  ])('does not throw for %s', (_, value) => {
    const pass = () => assert(value, 'Testing truthy values');

    expect(pass).not.toThrow();
  });

  // Purely a test of type signatures.
  it('narrows types', () => {
    const value: void | number = 10 as any;
    assert(value, 'Statement narrows "value" type');

    // If narrowing breaks, this will cause a type error.
    value.toFixed();
  });
});
