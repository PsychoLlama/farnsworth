import createStore from '../../utils/create-store';
import * as actions from '../../actions';
import * as deviceEffects from '../../effects/devices';
import { TrackKind } from '../../utils/constants';

jest.mock('../../effects/devices');

const mockedEffects: jest.Mocked<typeof deviceEffects> = deviceEffects as any;

describe('Tracks reducer', () => {
  function setup() {
    const store = createStore();

    return {
      store,
    };
  }

  beforeEach(() => {
    mockedEffects.requestMediaDevices.mockResolvedValue([
      { kind: TrackKind.Audio, trackId: 'first', deviceId: 'mic' },
      { kind: TrackKind.Video, trackId: 'second', deviceId: 'cam' },
    ]);
  });

  describe('requestMediaDevices()', () => {
    it('adds the new tracks', async () => {
      const { store } = setup();
      await store.dispatch(actions.devices.requestMediaDevices());

      expect(store.getState().tracks).toMatchInlineSnapshot(`
        Object {
          "first": Object {
            "kind": "audio",
          },
          "second": Object {
            "kind": "video",
          },
        }
      `);
    });
  });
});
