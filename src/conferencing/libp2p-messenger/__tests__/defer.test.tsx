import defer from '../defer';

describe('defer', () => {
  it('returns an externally controllable promise', async () => {
    const p = defer();

    p.resolve(15);

    await expect(p.promise).resolves.toBe(15);
  });

  it('can reject the promise externally', async () => {
    const p = defer();

    const error = new Error('Testing defer() rejection');
    p.reject(error);

    await expect(p.promise).rejects.toBe(error);
  });
});
