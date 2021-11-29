import AppEvents from '../app-events';
import { TrackKind, EventType } from '../../utils/constants';
import sdk from '../../utils/sdk';

jest.mock('../../utils/sdk');

describe('AppEvents', () => {
  it('ignores unknown events', async () => {
    const app = new AppEvents({ remoteId: 'remote-id' });
    const promise = app.handleEvent({ type: 'unknown' } as any);

    await expect(promise).resolves.not.toThrow();
  });

  it('dispatches pause & resume events', async () => {
    const app = new AppEvents({ remoteId: 'remote-id' });

    await app.handleEvent({
      type: EventType.Pause,
      payload: { kind: TrackKind.Video },
    });

    await app.handleEvent({
      type: EventType.Resume,
      payload: { kind: TrackKind.Video },
    });

    expect(sdk.tracks.markPaused).toHaveBeenCalled();
    expect(sdk.tracks.markResumed).toHaveBeenCalled();
  });

  it('adds remote chat messages', async () => {
    const app = new AppEvents({ remoteId: 'remote-id' });

    const msg = {
      author: 'attempt-to-forge-author',
      sentDate: new Date().toISOString(),
      body: 'Did you see that *ludicrus* display last night?',
    };

    await app.handleEvent({
      type: EventType.ChatMessage,
      payload: msg,
    });

    expect(sdk.chat.receiveMessage).toHaveBeenCalledWith({
      ...msg,
      author: 'remote-id',
    });
  });
});
