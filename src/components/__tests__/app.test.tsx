import renderer from '../../testing/renderer';
import { App } from '../app';

describe('App', () => {
  const setup = renderer(App, {
    getDefaultProps: () => ({
      requestMediaDevices: jest.fn(),
      connectToServer: jest.fn(),
      closeAllConnections: jest.fn(),
    }),
  });

  it('grabs a media stream on mount', () => {
    const { props } = setup();

    expect(props.requestMediaDevices).toHaveBeenCalled();
  });

  it('connects to the server on mount', () => {
    const { props } = setup();

    expect(props.connectToServer).toHaveBeenCalled();
  });

  it('shuts down all active connections on unmount', () => {
    const { props } = setup();

    expect(props.closeAllConnections).not.toHaveBeenCalled();
    window.dispatchEvent(new Event('beforeunload'));
    expect(props.closeAllConnections).toHaveBeenCalled();
  });

  it('does not leak unload listeners into the document', () => {
    const { output, props } = setup();

    output.unmount();
    window.dispatchEvent(new Event('beforeunload'));

    expect(props.closeAllConnections).not.toHaveBeenCalled();
  });
});
