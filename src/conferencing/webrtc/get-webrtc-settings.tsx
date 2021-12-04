import * as effects from '../../effects';
import { STUN_SERVERS } from '../../utils/constants';

/**
 * Generates a peer connection configuration object by consulting user-defined
 * app settings. This allows power users to define custom STUN/TURN servers
 * that have credentials without compiling those keys into a new application.
 */
export default async function getWebrtcSettings(): Promise<RTCConfiguration> {
  const settings = await effects.settings.load();

  const defaultIceServers = settings.disableDefaultIceServers
    ? []
    : STUN_SERVERS.map((addr) => ({ urls: `stun:${addr}` }));

  return {
    iceTransportPolicy: settings.forceTurnRelay ? 'relay' : 'all',
    iceServers: [].concat(settings.customIceServers).concat(defaultIceServers),
  };
}
