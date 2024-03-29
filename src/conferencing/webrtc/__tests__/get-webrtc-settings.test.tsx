import localforage from 'localforage';
import getWebrtcSettings from '../get-webrtc-settings';
import { ICE_SERVERS } from '../../../utils/constants';

jest.mock('localforage');

const mockedLocalforage: jest.Mocked<typeof localforage> = localforage as any;

describe('getWebrtcSettings', () => {
  beforeEach(() => {
    ICE_SERVERS.length = 0;
    mockedLocalforage.getItem.mockResolvedValue(null);
  });

  it('returns the settings', async () => {
    const settings = await getWebrtcSettings();

    expect(settings).toEqual({
      iceTransportPolicy: 'all',
      iceServers: [],
    });
  });

  it('conditionally forces connection over relay', async () => {
    mockedLocalforage.getItem.mockResolvedValue({
      forceTurnRelay: true,
    });

    await expect(getWebrtcSettings()).resolves.toMatchObject({
      iceTransportPolicy: 'relay',
    });
  });

  it('adds the preconfigured ice servers', async () => {
    ICE_SERVERS.push(
      { urls: 'stun:stun1.example.com' },
      { urls: 'stun:stun2.example.com' },
    );

    await expect(getWebrtcSettings()).resolves.toMatchObject({
      iceServers: [
        { urls: 'stun:stun1.example.com' },
        { urls: 'stun:stun2.example.com' },
      ],
    });
  });

  it('includes the user-defined ice servers', async () => {
    ICE_SERVERS.push({ urls: 'stun:default-stun.example.com' });
    mockedLocalforage.getItem.mockResolvedValue({
      customIceServers: [{ urls: 'stun:custom-stun.example.com' }],
    });

    await expect(getWebrtcSettings()).resolves.toMatchObject({
      iceServers: [
        { urls: 'stun:custom-stun.example.com' },
        { urls: 'stun:default-stun.example.com' },
      ],
    });
  });

  it('conditionally excludes the default ice servers', async () => {
    ICE_SERVERS.push({ urls: 'stun:default-stun.example.com' });
    mockedLocalforage.getItem.mockResolvedValue({
      disableDefaultIceServers: true,
      customIceServers: [{ urls: 'stun:custom-stun.example.com' }],
    });

    await expect(getWebrtcSettings()).resolves.toMatchObject({
      iceServers: [{ urls: 'stun:custom-stun.example.com' }],
    });
  });
});
