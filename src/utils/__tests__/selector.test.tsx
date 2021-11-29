import selector from '../selector';

describe('selector(...)', () => {
  it('returns the same value given the same parameter', () => {
    const getList = selector((x: number) => [x]);

    // Identical reference between invocations.
    expect(getList(1)).toBe(getList(1));
  });

  it('drops old items from the cache if the input is different', () => {
    const getList = selector((x: number) => [x]);
    const original = getList(1);

    // Doesn't accidentally over-cache.
    expect(getList(2)).toEqual([2]);

    // This is why the function is not called `memoize(...)`.
    expect(getList(1)).not.toBe(original);
  });
});
