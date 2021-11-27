import React from 'react';
import provide from 'immer';
import { RouteObserver, mapStateToProps } from '../route-observer';
import renderer from '../../testing/renderer';
import { Routes } from '../../utils/constants';
import initialState, { State } from '../../reducers/initial-state';

describe('RouteObserver', () => {
  const setup = renderer(RouteObserver, {
    getDefaultProps: () => ({
      dial: jest.fn() as any, // Imperative action creator.
      relayServer: '/server/multiaddr',
      route: {
        id: Routes.Home,
        pathName: Routes.Home,
        params: {},
      },
    }),
  });

  it('renders the children', () => {
    const Noop = () => null;

    const { output } = setup({
      children: <Noop />,
    });

    expect(output.find(Noop).exists()).toBe(true);
  });

  it('autodials the remote peer given the correct route', () => {
    const { output, props } = setup();

    expect(props.dial).not.toHaveBeenCalled();
    output.setProps({
      route: {
        id: Routes.Call,
        pathName: '/call/john',
        params: { peerId: 'john' },
      },
    });

    expect(props.dial).toHaveBeenCalledWith(
      `${props.relayServer}/p2p-circuit/p2p/john`,
    );
  });

  it('waits for the network to initialize before calling', () => {
    const { output, props } = setup({ relayServer: null });

    expect(props.dial).not.toHaveBeenCalled();
    output.setProps({
      route: {
        id: Routes.Call,
        pathName: '/call/john',
        params: { peerId: 'john' },
      },
    });

    expect(props.dial).not.toHaveBeenCalled();
    output.setProps({ relayServer: '/server/multiaddr' });
    expect(props.dial).toHaveBeenCalledWith(
      '/server/multiaddr/p2p-circuit/p2p/john',
    );
  });

  describe('mapStateToProps', () => {
    function setup(patch: (state: State) => unknown) {
      const state = provide(initialState, patch);
      const props = mapStateToProps(state);

      return {
        props,
        state,
      };
    }

    it('grabs the active route', () => {
      const { state, props } = setup(() => undefined);

      expect(props.route).toBe(state.route);
    });

    it('shows if we are connected to the server', () => {
      const { state, props } = setup((state) => {
        state.relay = {
          server: '/server/multiaddr',
          localId: 'local-id',
        };
      });

      expect(props).toMatchObject({
        relayServer: state.relay.server,
      });
    });
  });
});
