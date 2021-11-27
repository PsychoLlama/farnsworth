import ReduxRouter from '../redux-router';
import createStore from '../../create-store';
import * as actions from '../../../actions';

jest.spyOn(actions.route, 'change');

describe('ReduxRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    location.hash = '';
  });

  it('redirects to root for invalid paths', () => {
    location.hash = '#/no/such/route';

    const router = ReduxRouter.init({
      store: createStore(),
      routes: {
        '/some/:dynamic/path': { effect: null },
        '/': { effect: null },
      },
    });

    expect(router.getRoute()).toMatchObject({
      id: '/',
      params: {},
    });
  });

  it('matches the location hash to the correct route', () => {
    location.hash = '#/primary';

    const router = ReduxRouter.init({
      store: createStore(),
      routes: {
        '/primary': { effect: null },
        '/': { effect: null },
      },
    });

    expect(router.getRoute()).toMatchObject({
      id: '/primary',
      params: {},
    });
  });

  it('matches parametrized paths to the correct route', () => {
    location.hash = '#/user/unique-id/activity';

    const router = ReduxRouter.init({
      store: createStore(),
      routes: {
        '/user/:id/activity': { effect: null },
      },
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
      store: createStore(),
      routes: {
        '/ambiguous/:id': { effect: null },
        '/ambiguous/route': { effect: null },
      },
    });

    expect(router.getRoute()).toMatchObject({
      id: '/ambiguous/route',
      params: {},
    });
  });

  it('can interpolate multiple dynamic values', () => {
    location.hash = '#/user/mock-user-id/post/mock-post-id/';

    const router = ReduxRouter.init({
      store: createStore(),
      routes: {
        '/user/:userId/post/:postId': { effect: null },
      },
    });

    expect(router.getRoute()).toMatchObject({
      id: '/user/:userId/post/:postId',
      pathName: '/user/mock-user-id/post/mock-post-id',
      params: { userId: 'mock-user-id', postId: 'mock-post-id' },
    });
  });

  it('clamps the browser URL to a known good', () => {
    location.hash = '#known/route/';

    // Side effect: sync URL to redux.
    ReduxRouter.init({
      store: createStore(),
      routes: {
        '/known/route': { effect: null },
      },
    });

    expect(location.hash).toBe('#/known/route');
  });

  it('watches the browser URL for changes', () => {
    location.hash = '#/random/route';

    const router = ReduxRouter.init({
      store: createStore(),
      routes: {
        '/random/route': { effect: null },
        '/': { effect: null },
      },
    });

    location.hash = '#/invalid/route';
    window.onhashchange(new HashChangeEvent('hashchange'));

    expect(router.getRoute().pathName).toBe('/');
  });

  it('dispatches URL changes to redux', () => {
    location.hash = '#/';

    const router = ReduxRouter.init({
      store: createStore(),
      routes: {
        '/path': { effect: null },
        '/': { effect: null },
      },
    });

    location.hash = '#/path';
    window.onhashchange(new HashChangeEvent('hashchange'));

    expect(actions.route.change).toHaveBeenCalledWith(router.getRoute());
  });

  it('does not dispatch an action if the route is identical', () => {
    location.hash = '';

    ReduxRouter.init({
      store: createStore(),
      routes: {
        '/': { effect: null },
      },
    });

    location.hash = '#/';
    window.onhashchange(new HashChangeEvent('hashchange'));

    expect(actions.route.change).not.toHaveBeenCalled();
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
