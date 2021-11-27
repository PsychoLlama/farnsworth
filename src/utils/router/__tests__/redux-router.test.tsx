import ReduxRouter from '../redux-router';

describe('ReduxRouter', () => {
  beforeEach(() => {
    location.hash = '';
  });

  it('redirects to root for invalid paths', () => {
    location.hash = '#/no/such/route';

    const router = ReduxRouter.init({
      '/some/:dynamic/path': { effect: null },
      '/': { effect: null },
    });

    expect(router.getRoute()).toMatchObject({
      id: '/',
      params: {},
    });
  });

  it('matches the location hash to the correct route', () => {
    location.hash = '#/primary';

    const router = ReduxRouter.init({
      '/primary': { effect: null },
      '/': { effect: null },
    });

    expect(router.getRoute()).toMatchObject({
      id: '/primary',
      params: {},
    });
  });

  it('matches parametrized paths to the correct route', () => {
    location.hash = '#/user/unique-id/activity';

    const router = ReduxRouter.init({
      '/user/:id/activity': { effect: null },
    });

    expect(router.getRoute()).toEqual({
      id: '/user/:id/activity',
      pathName: '/user/unique-id/activity',
      params: { id: 'unique-id' },
    });
  });

  it('prefers static routes', () => {
    location.hash = '#/ambiguous/route';

    const router = ReduxRouter.init({
      '/ambiguous/:id': { effect: null },
      '/ambiguous/route': { effect: null },
    });

    expect(router.getRoute()).toMatchObject({
      id: '/ambiguous/route',
      params: {},
    });
  });

  it('can interpolate multiple dynamic values', () => {
    location.hash = '#/user/mock-user-id/post/mock-post-id/';

    const router = ReduxRouter.init({
      '/user/:userId/post/:postId': { effect: null },
    });

    expect(router.getRoute()).toMatchObject({
      id: '/user/:userId/post/:postId',
      pathName: '/user/mock-user-id/post/mock-post-id',
      params: { userId: 'mock-user-id', postId: 'mock-post-id' },
    });
  });

  describe('normalizePath', () => {
    it('trims the leading hash sign', () => {
      const value = ReduxRouter.normalizePath('#/with/a/#/hash');

      expect(value).toBe('/with/a/#/hash');
    });

    it('forces leading slashes', () => {
      const value = ReduxRouter.normalizePath('#path/to/place');

      expect(value).toBe('/path/to/place');
    });

    it('removes trailing slashes', () => {
      const value = ReduxRouter.normalizePath('#/trailing/slash/');

      expect(value).toBe('/trailing/slash');
    });

    it('transforms empty inputs to a root path', () => {
      expect(ReduxRouter.normalizePath('')).toBe('/');
    });
  });
});
