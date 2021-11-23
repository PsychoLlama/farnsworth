import AppEvents from '../app-events';
import { TrackKind } from '../../utils/constants';
import sdk from '../../utils/sdk';

jest.mock('../../utils/sdk');

describe('AppEvents', () => {
  it('ignores unknown events', async () => {
    const app = new AppEvents();
    const promise = app.handleEvent({ type: 'unknown' } as any);

    await expect(promise).resolves.not.toThrow();
  });

  it('dispatches pause & resume events', async () => {
    const app = new AppEvents();

    await app.handleEvent({
      type: 'pause',
      payload: { kind: TrackKind.Video },
    });

    await app.handleEvent({
      type: 'resume',
      payload: { kind: TrackKind.Video },
    });

    expect(sdk.tracks.markPaused).toHaveBeenCalled();
    expect(sdk.tracks.markResumed).toHaveBeenCalled();
  });
});
