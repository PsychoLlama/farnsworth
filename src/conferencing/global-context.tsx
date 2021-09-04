import Libp2p from 'libp2p';

// Video centric apps deal with a lot of stateful objects. Things like media
// stream tracks, audio contexts, recorders, etc. None of those can exist in
// redux (state must be JSON serializable). But it has to go somewhere. So
// we put it here.
//
// For example, if you needed to associate a video track with a meeting
// member, you'd set the MediaStreamTrack here from inside the action creator.
// Then, from the reducer, you'd reference it by plain ID.
//
// Now as you can imagine, global mutable state isn't ideal. Here are some
// rules to keep things sane.
//
// THE RULES:
// 1. Never mutate state outside a redux action.
// 2. Never read state directly. Use/write a selector function in this folder.
// 3. Don't remove an object from state if redux is still referencing it.
// 4. Only store here what cannot be stored in redux.
const context: GlobalContext = {
  tracks: new Map(),
  p2p: null,
};

interface GlobalContext {
  // Mapping { track.id => Track }
  tracks: Map<string, MediaStreamTrack>;

  // Singleton, asynchronously initialized at startup.
  p2p: null | Libp2p;
}

export default context;
