import * as effects from '../../effects';
import { ICE_SERVERS } from '../../utils/constants';

/**
 * Generates a peer connection configuration object by consulting user-defined
 * app settings. This allows power users to define custom STUN/TURN servers
 * that have credentials without compiling those keys into a new application.
 */
export default async function getWebrtcSettings(): Promise<RTCConfiguration> {
  const { forceTurnRelay, disableDefaultIceServers, customIceServers } =
    await effects.settings.load();

  return {
    iceTransportPolicy: forceTurnRelay ? 'relay' : 'all',
    iceServers: []
      .concat(customIceServers)
      .concat(disableDefaultIceServers ? [] : ICE_SERVERS),
  };
}
