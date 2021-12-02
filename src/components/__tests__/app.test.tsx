import provide from 'immer';
import renderer from '../../testing/renderer';
import { App, mapStateToProps } from '../app';
import initialState, { State } from '../../reducers/initial-state';

describe('App', () => {
  const setup = renderer(App, {
    getDefaultProps: () => ({
      requestMediaDevices: jest.fn(),
      connectToServer: jest.fn(),
      loadDeviceList: jest.fn(),
      observeDeviceList: jest.fn() as any, // Imperative action creator.
      appInitialized: false,
    }),
  });

  it('grabs a media stream on mount', () => {
    const { props } = setup();

    expect(props.requestMediaDevices).toHaveBeenCalled();
  });

  it('connects to the server on mount', () => {
    const { props } = setup();

    expect(props.connectToServer).toHaveBeenCalled();
  });

  it('does not initialize the application if already set up', () => {
    const { props } = setup({ appInitialized: true });

    expect(props.requestMediaDevices).not.toHaveBeenCalled();
    expect(props.connectToServer).not.toHaveBeenCalled();
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

    it('returns the right props', () => {
      const { props } = setup((state) => {
        state.relay = {
          server: '/server/multiaddr',
          localId: 'my-local-id',
        };
      });

      expect(props).toMatchObject({
        appInitialized: true,
      });
    });
  });
});
