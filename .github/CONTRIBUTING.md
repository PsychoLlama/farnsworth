# Contributing

Hey, and welcome to the project!

## Getting Started

- Run `./bin/setup.mjs` to initialize the development environment.
- Run `yarn start:server`. Note the log output.
- Make a `.env` file and set `RELAY_SERVER_ADDRESS` as one of the log outputs.
- Run `yarn start:web` to build the app.

Open your browser to `localhost:1234`. The app should be live.

---

If you plan to make a big change, please open an issue first.

## Project Structure

- WebRTC state is kept in `./src/conferencing/global-context`.
- WebRTC utilities are kept in `./src/conferencing`.
- All IO is kept in `./src/effects`.
- Redux is managed by [retreon](https://retreon.archetype.foundation/).

