import { AdvancedSettings, mapStateToProps } from '../advanced-settings';
import renderer from '../../../testing/renderer';
import initialState from '../../../reducers/initial-state';
import { STUN_SERVERS } from '../../../utils/constants';

describe('AdvancedSettings', () => {
  const setup = renderer(AdvancedSettings, {
    getDefaultProps: () => ({
      loadSettings: jest.fn(),
      forceTurnRelay: false,
      useDefaultIceServers: true,
      iceServers: [],
    }),
  });

  it('renders every ice server url', () => {
    const { findByTestId } = setup({
      iceServers: [
        { urls: 'stun:stun.example.com' },
        { urls: ['stun:stun1.example.com', 'stun:stun2.example.com'] },
      ],
    });

    expect(findByTestId('ice-server-address').length).toBe(
      3 + STUN_SERVERS.length,
    );
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

  describe('mapStateToProps', () => {
    it('returns the expected props', () => {
      const props = mapStateToProps(initialState);

      expect(props).toMatchInlineSnapshot(`
        Object {
          "forceTurnRelay": false,
          "iceServers": Array [],
          "useDefaultIceServers": true,
        }
      `);
    });
  });
});
