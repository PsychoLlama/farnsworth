import renderer from '../../../testing/renderer';
import { IceServer, mapStateToProps, ServerType } from '../ice-server';
import initialState from '../../../reducers/initial-state';

describe('IceServer', () => {
  const setup = renderer(IceServer, {
    getDefaultProps: () => ({
      updateSettings: jest.fn(),
      onClose: jest.fn(),
      iceServers: [],
      id: 0,
    }),
  });

  it('closes the panel when you click cancel', () => {
    const { findByTestId, props } = setup();

    findByTestId('cancel-button').simulate('click');

    expect(props.onClose).toHaveBeenCalled();
  });

  it('saves the ICE server and closes the form when finished', async () => {
    const { findByTestId, props } = setup({ id: 1 });

    findByTestId('server-type').simulate('change', {
      currentTarget: { value: ServerType.Stun },
    });

    findByTestId('url-input').simulate('input', {
      currentTarget: { value: 'stun2.example.com' },
    });

    const { onSubmit } = findByTestId('form').props();
    await onSubmit(new Event('click'));

    expect(props.onClose).toHaveBeenCalled();
    expect(props.updateSettings).toHaveBeenCalledWith({
      customIceServers: props.iceServers.concat([
        { urls: 'stun:stun2.example.com' },
      ]),
    });
  });

  it('updates existing ICE servers in place', async () => {
    const { findByTestId, props } = setup({
      id: 1,
      iceServers: [
        { urls: 'stun:stun1.example.com' },
        { urls: 'stun:stun2.example.com' },
      ],
    });

    findByTestId('server-type').simulate('change', {
      currentTarget: { value: ServerType.Stun },
    });

    findByTestId('url-input').simulate('input', {
      currentTarget: { value: 'stun3.example.com' },
    });

    const { onSubmit } = findByTestId('form').props();
    await onSubmit(new Event('click'));

    expect(props.updateSettings).toHaveBeenCalledWith({
      customIceServers: [
        { urls: 'stun:stun1.example.com' },
        { urls: 'stun:stun3.example.com' },
      ],
    });
  });

  it('adds usernames and passwords, if configured', async () => {
    const { findByTestId, props } = setup();

    findByTestId('server-type').simulate('change', {
      currentTarget: { value: ServerType.Turn },
    });

    findByTestId('url-input').simulate('input', {
      currentTarget: { value: 'example.com' },
    });

    findByTestId('username-input').simulate('input', {
      currentTarget: { value: 'geralt' },
    });

    findByTestId('password-input').simulate('input', {
      currentTarget: { value: 'let-me-pass' },
    });

    const { onSubmit } = findByTestId('form').props();
    await onSubmit(new Event('click'));

    expect(props.updateSettings).toHaveBeenCalledWith({
      customIceServers: [
        {
          urls: 'turn:example.com',
          credentialType: 'password',
          credential: 'let-me-pass',
          username: 'geralt',
        },
      ],
    });
  });

  it('restores field state when editing an existing server', () => {
    const server = {
      urls: 'turn:server.farnsworth.video',
      username: 'username',
      credential: 'password',
    };

    const { output } = setup({
      iceServers: [server],
    });

    // Deal with it.
    expect(output.state()).toMatchObject({
      url: 'server.farnsworth.video',
      username: server.username,
      credential: server.credential,
      serverType: ServerType.Turn,
    });
  });

  describe('mapDispatchToProps', () => {
    it('returns the expected fields', () => {
      const props = mapStateToProps(initialState);

      expect(props).toMatchInlineSnapshot(`
        Object {
          "iceServers": Array [],
        }
      `);
    });
  });
});
