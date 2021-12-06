import renderer from '../../testing/renderer';
import { DeviceErrorModal, mapStateToProps } from '../device-error-modal';
import initialState from '../../reducers/initial-state';
import { DeviceError } from '../../utils/constants';

describe('DeviceErrorModal', () => {
  const setup = renderer(DeviceErrorModal, {
    getDefaultProps: () => ({
      close: jest.fn(),
      deviceError: DeviceError.NotAllowed,
    }),
  });

  it('renders nothing if there is no error', () => {
    const { output } = setup({ deviceError: null });

    expect(output.isEmptyRender()).toBe(true);
  });

  it('shows the right error text', () => {
    const { findByTestId, output } = setup();

    expect(findByTestId('error-text').text()).toMatch(/microphone or camera/);

    output.setProps({ deviceError: DeviceError.Unknown });
    expect(findByTestId('error-text').text()).toMatch(/went wrong/);
  });

  it('closes the modal when you click the close button', () => {
    const { findByTestId, props } = setup();

    findByTestId('close-button').simulate('click');

    expect(props.close).toHaveBeenCalled();
  });

  it('closes the modal on escape key', () => {
    const { findByTestId, props } = setup();

    findByTestId('event-observer').simulate(
      'event',
      new KeyboardEvent('keydown', { key: 'a' }),
    );

    expect(props.close).not.toHaveBeenCalled();
    findByTestId('event-observer').simulate(
      'event',
      new KeyboardEvent('keydown', { key: 'Escape' }),
    );

    expect(props.close).toHaveBeenCalled();
  });

  describe('mapStateToProps', () => {
    it('returns the expected fields', () => {
      const props = mapStateToProps(initialState);

      expect(props).toMatchInlineSnapshot(`
        Object {
          "deviceError": null,
        }
      `);
    });
  });
});
