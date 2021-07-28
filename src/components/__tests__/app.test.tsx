import renderer from '../../testing/renderer';
import { App } from '../app';

describe('App', () => {
  const setup = renderer(App, {
    getDefaultProps: () => ({
      requestMediaDevices: jest.fn(),
      connectToServer: jest.fn(),
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
});
