<div align="center">
  <h1>Farnsworth</h1>
  <p>A P2P video meeting app.<p>
</div>

## Development

- Clone the [signaling relay](https://github.com/PsychoLlama/p2p-signaling-relay) and follow the setup instructions.
- Start the signaling server with `yarn start`.
- Create a `.env` file. Add an environment variable `RELAY_SERVER_ADDRESS` with the signaling server multiaddr.
- Run `yarn start` in the frontend server.
- Profit.

