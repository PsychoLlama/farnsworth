import Libp2pMessenger from '../libp2p-messenger';
import { Stream } from '../../../testing/mocks/libp2p';

describe('Libp2p Signaling Messenger', () => {
  describe('send', () => {
    it('sends JSON-encoded messages through the stream', async () => {
      const stream = new Stream();
      const messenger = Libp2pMessenger.from(stream);

      const msg = { arbitrary: 'payload' };
      messenger.send(msg);
      await messenger.drain();

      expect(stream.observer).toHaveBeenCalledTimes(1);
      expect(stream.observer).toHaveBeenCalledWith(JSON.stringify(msg));
    });
  });

  describe('subscribe', () => {
    it('subscribes to and drains the stream', async () => {
      const payload = { hello: 'world' };
      const stream = Stream.from([JSON.stringify(payload)]);
      const messenger = Libp2pMessenger.from(stream);

      const spy = jest.fn();
      await messenger.subscribe(spy);

      expect(spy).toHaveBeenCalledWith(payload);
    });
  });

  describe('close', () => {
    it('closes the libp2p stream', () => {
      const stream = new Stream();
      const messenger = Libp2pMessenger.from(stream);

      expect(stream.close).not.toHaveBeenCalled();
      messenger.close();
      expect(stream.close).toHaveBeenCalled();
    });
  });
});
