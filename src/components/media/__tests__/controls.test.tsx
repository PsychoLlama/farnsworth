import renderer from '../../../testing/renderer';
import { Controls, mapStateToProps } from '../controls';
import createStore from '../../../utils/create-store';

describe('Controls', () => {
  const setup = renderer(Controls, {
    getDefaultProps: () => ({
      togglePhonebook: jest.fn(),
      toggleTrack: jest.fn(),
      micTrackId: 'a-id',
      camTrackId: 'v-id',
    }),
  });

  it('opens the phonebook when the control is clicked', () => {
    const { findByTestId, props } = setup();

    findByTestId('toggle-phonebook').simulate('click');

    expect(props.togglePhonebook).toHaveBeenCalled();
  });

  it('toggles the video track when you click the button', () => {
    const { findByTestId, props } = setup();

    findByTestId('toggle-video').simulate('click');

    expect(props.toggleTrack).toHaveBeenCalledWith(props.camTrackId);
  });

  it('toggles the audio track when you click the button', () => {
    const { findByTestId, props } = setup();

    findByTestId('toggle-audio').simulate('click');

    expect(props.toggleTrack).toHaveBeenCalledWith(props.micTrackId);
  });

  describe('mapStateToProps', () => {
    function setup() {
      const store = createStore();
      const props = mapStateToProps(store.getState());

      return {
        props,
        store,
      };
    }

    it('returns the expected props', () => {
      const { props } = setup();

      expect(props).toMatchInlineSnapshot(`
        Object {
          "micTrackId": undefined,
          "camTrackId": undefined,
        }
      `);
    });
  });
});
