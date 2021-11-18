import { encode } from '@msgpack/msgpack';
import DataChannelMessenger from '../data-channel-messenger';

describe('DataChannelMessenger', () => {
  function setup() {
    const pc = new RTCPeerConnection();
    const messenger = new DataChannelMessenger(pc);

    expect(pc.createDataChannel).toHaveBeenCalled();

    const channel: jest.Mocked<RTCDataChannel> = (messenger as any).channel;

    return {
      pc,
      messenger,
      channel,
    };
  }

  it('properly encodes outbound messages', () => {
    const { messenger, channel } = setup();

    const event = { type: 'T', data: new Uint8Array([1, 2, 3]) };
    messenger.sendEvent(event);

    expect(channel.send).toHaveBeenCalledTimes(1);
  });

  // Well, we assume they're logged somewhere.
  it('simply ignores malformed messages', async () => {
    const { channel } = setup();

    const sendData = async <T,>(data: T) =>
      channel.onmessage(new MessageEvent('message', { data }));

    const sendMsg = <T,>(data: T) => sendData(encode(data));

    await expect(sendData('should be binary')).resolves.not.toThrow();
    await expect(sendData(new Uint8Array([1, 1]))).resolves.not.toThrow();

    await expect(sendMsg({})).resolves.not.toThrow();
    await expect(sendMsg([1, 2, 3])).resolves.not.toThrow();
    await expect(sendMsg(5)).resolves.not.toThrow();
    await expect(sendMsg(null)).resolves.not.toThrow();
    await expect(sendMsg(true)).resolves.not.toThrow();
    await expect(sendMsg({ data: 'missing type' })).resolves.not.toThrow();
    await expect(
      sendMsg({ type: 0, data: { data: 'missing type' } }),
    ).resolves.not.toThrow();

    // Finally, something valid.
    await expect(
      sendMsg({ type: 0, data: { type: 'T' } }),
    ).resolves.not.toThrow();
  });
});
