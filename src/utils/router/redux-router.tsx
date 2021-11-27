import assert from 'assert';
import store from '../redux-store';
import * as actions from '../../actions';

/**
 * React Router is a heavy hammer to a simple problem. Binding URL state to
 * redux and conditionally rendering those states seems too easy to justify
 * a library. Plus, in-house enables much tighter integration with redux.
 */
export default class ReduxRouter {
  dynamicRoutes: Array<DynamicRoute> = [];
  staticRoutes: Map<string, RouteDefinition> = new Map();
  store: Config['store'];

  /**
   * Transform `location.hash` into a consistent path name.
   *
   * #path/to/route/ -> /path/to/route
   */
  static normalizePath(hash: string) {
    return hash
      .replace(/^#/, '') // No leading hash signs.
      .replace(/^([^/])/, '/$1') // No trailing slashes.
      .replace(/\/$/, '') // Force leading slashes.
      .replace(/^$/, '/'); // Redirect '' to '/'.
  }

  /**
   * Observes the browser URL and clamps it to the given routes. Changes are
   * dispatched to redux.
   */
  static init(config: Config) {
    const router = new ReduxRouter(config);
    router.updateUrl();

    window.onhashchange = router.updateUrl;

    return router;
  }

  private constructor({ routes, store }: Config) {
    this.store = store;

    // Put paths with `:id` matchers in a different collection.
    Object.entries(routes).forEach(([id, definition]) => {
      if (/:/.test(id)) {
        const parts = this.getParts(id);
        this.dynamicRoutes.push({ parts, definition, id });
      } else {
        this.staticRoutes.set(id, definition);
      }
    });
  }

  getRoute(): Route {
    const pathName = ReduxRouter.normalizePath(location.hash);

    if (this.staticRoutes.get(pathName)) {
      return { id: pathName, pathName, params: {} };
    }

    return this.resolveDynamicRoute(pathName);
  }

  private resolveDynamicRoute(pathName: string): Route {
    const parts = this.getParts(pathName);

    function matchesRoute(matcher: DynamicRoute) {
      return matcher.parts.every((part: string, index: number) => {
        const isMatcher = part[0] === ':'; // :someIdentifier
        return isMatcher ? true : parts[index] === part;
      });
    }

    const matchingRoutes = this.dynamicRoutes
      .filter((matcher) => parts.length === matcher.parts.length)
      .filter(matchesRoute);

    // Each path should match exactly one route.
    assert(matchingRoutes.length <= 1, `Ambiguous route: ${pathName}`);

    return this.fillDynamicRoute(matchingRoutes[0], pathName, parts);
  }

  private fillDynamicRoute(
    route: void | DynamicRoute,
    pathName: string,
    parts: Array<string>,
  ): Route {
    if (!route) {
      return { id: '/', pathName: '/', params: {} };
    }

    const params: Route['params'] = {};

    route.parts.forEach((part, index) => {
      if (part[0] === ':') {
        params[part.slice(1)] = parts[index];
      }
    });

    return { id: route.id, pathName, params };
  }

  // '/path/to/resource' -> ['path', 'to', 'resource']
  private getParts(pathName: string): Array<string> {
    return pathName.split('/').filter(Boolean);
  }

  private updateUrl = () => {
    const state = this.store.getState();
    const route = this.getRoute();

    // Clamp the browser's URL to a known route.
    if (location.hash.slice(1) !== route.pathName) {
      const url = new URL(String(location));
      url.hash = route.pathName;

      history.replaceState({}, '', url);
    }

    if (state.route.pathName !== route.pathName) {
      this.store.dispatch(actions.route.change(route));
    }
  };
}

interface Config {
  store: typeof store;
  routes: Routes;
}

interface RouteDefinition {
  /**
   * An arbitrary effect associated with the route, intended to run when the
   * page enters. This is not invoked here but passed to the action creator.
   */
  effect: null;
}

export interface Route {
  id: string;
  pathName: string;
  params: {
    [name: string]: string;
  };
}

interface Routes {
  [id: string]: RouteDefinition;
}

interface DynamicRoute {
  id: string;
  parts: Array<string>;
  definition: RouteDefinition;
}
