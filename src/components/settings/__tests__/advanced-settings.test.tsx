import { AdvancedSettings, mapStateToProps } from '../advanced-settings';
import renderer from '../../../testing/renderer';
import initialState from '../../../reducers/initial-state';
import { ICE_SERVERS } from '../../../utils/constants';

describe('AdvancedSettings', () => {
  beforeEach(() => {
    ICE_SERVERS.length = 0;
  });

  const setup = renderer(AdvancedSettings, {
    getDefaultProps: () => ({
      loadSettings: jest.fn(),
      updateSettings: jest.fn(),
      onEditIceServer: jest.fn(),
      forceTurnRelay: false,
      disableDefaultIceServers: false,
      customIceServers: [],
    }),
  });

  it('renders every ice server url', () => {
    ICE_SERVERS.push({ urls: 'default-stun.example.com' });

    const { findByTestId } = setup({
      customIceServers: [
        { urls: 'stun:stun.example.com' },
        { urls: ['stun:stun1.example.com', 'stun:stun2.example.com'] },
      ],
    });

    expect(findByTestId('ice-server-address').length).toBe(
      3 + ICE_SERVERS.length,
    );
  });

  it('hides default ice servers when they are disabled', () => {
    ICE_SERVERS.push({ urls: 'default-stun.example.com' });

    const { findByTestId } = setup({
      disableDefaultIceServers: true,
      customIceServers: [{ urls: 'stun:stun.example.com' }],
    });

    expect(findByTestId('ice-server-address').length).toBe(1);
  });

  it('loads app settings when you open the advanced panel', () => {
    const { findByTestId, props } = setup();

    findByTestId('advanced-settings').simulate('toggle', {
      currentTarget: { open: false },
    });

    expect(props.loadSettings).not.toHaveBeenCalled();

    findByTestId('advanced-settings').simulate('toggle', {
      currentTarget: { open: true },
    });

    expect(props.loadSettings).toHaveBeenCalled();
  });

  it('forces TURN relay when you flip the toggle', () => {
    const { findByTestId, props } = setup({ forceTurnRelay: false });

    const event = { currentTarget: { checked: true } };
    findByTestId('toggle-turn-relay').simulate('change', event);

    expect(props.updateSettings).toHaveBeenCalledWith({
      forceTurnRelay: true,
    });
  });

  it('disables default ICE servers when you flip the toggle', () => {
    const { findByTestId, props } = setup({ disableDefaultIceServers: false });

    const event = { currentTarget: { checked: true } };
    findByTestId('toggle-default-ice-servers').simulate('change', event);

    expect(props.updateSettings).toHaveBeenCalledWith({
      disableDefaultIceServers: true,
    });
  });

  it('starts editing the right ICE server ID when you click add', () => {
    const { findByTestId, props } = setup({
      customIceServers: [{ urls: 'stun:example.com' }],
    });

    findByTestId('add-ice-server').simulate('click');

    expect(props.onEditIceServer).toHaveBeenCalledWith({ id: 1 });
  });

  describe('mapStateToProps', () => {
    it('returns the expected props', () => {
      const props = mapStateToProps(initialState);

      expect(props).toMatchInlineSnapshot(`
        Object {
          "customIceServers": Array [],
          "disableDefaultIceServers": false,
          "forceTurnRelay": false,
        }
      `);
    });
  });
});
