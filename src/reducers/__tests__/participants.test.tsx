import createStore from '../../utils/create-store';
import * as actions from '../../actions';
import * as deviceEffects from '../../effects/devices';
import { TrackKind, MY_PARTICIPANT_ID } from '../../utils/constants';

jest.mock('../../effects/devices');

const mockedEffects: jest.Mocked<typeof deviceEffects> = deviceEffects as any;

describe('Participants reducer', () => {
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
    it('puts the track IDs on tha participant', async () => {
      const { store } = setup();

      await store.dispatch(actions.devices.requestMediaDevices());

      const { participants } = store.getState();
      expect(participants[MY_PARTICIPANT_ID]).toMatchObject({
        trackIds: ['first', 'second'],
      });
    });
  });
});
