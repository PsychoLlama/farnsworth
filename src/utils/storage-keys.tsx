enum StorageKey {
  /** Stores the libp2p pub/priv key pair. */
  PeerId = 'farnsworth/peer-id',

  /** Stores app settings, including ICE servers and auth details.  */
  Settings = 'farnsworth/settings',
}

export default StorageKey;
