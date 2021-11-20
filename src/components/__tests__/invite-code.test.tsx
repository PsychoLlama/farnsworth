import renderer from '../../testing/renderer';
import { InviteCode, mapStateToProps } from '../invite-code';
import createStore from '../../utils/create-store';
import * as actions from '../../actions';

(navigator as any).clipboard = {
  writeText: jest.fn(),
};

jest.useFakeTimers();

describe('InviteCode', () => {
  const setup = renderer(InviteCode, {
    getDefaultProps: () => ({
      localId: 'your-mom',
    }),
  });

  beforeEach(() => {
    (navigator as any).clipboard.writeText.mockClear();
  });

  it('copies the code to the clipboard', async () => {
    const { findByTestId, output, props } = setup();
    const { onClick } = findByTestId('copy-code').props();

    await onClick();
    output.update();

    expect(findByTestId('copy-code').text()).toBe('Copied!');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(props.localId);
  });

  it('dismisses the copied notice after a short time', async () => {
    const { findByTestId, output } = setup();
    const { onClick } = findByTestId('copy-code').props();

    await onClick();
    output.update();
    jest.runAllTimers();

    expect(findByTestId('copy-code').text()).not.toBe('Copied!');
  });

  describe('mapStateToProps', () => {
    it('returns placeholders while connecting to the relay', () => {
      const store = createStore();
      const props = mapStateToProps(store.getState());

      expect(props).toMatchInlineSnapshot(`
        Object {
          "localId": "",
        }
      `);
    });

    it('returns the full relay address', async () => {
      const store = createStore();
      await store.dispatch(actions.connections.listen('fake-server'));
      const props = mapStateToProps(store.getState());

      expect(props).toMatchInlineSnapshot(`
        Object {
          "localId": "mock-peer-id",
        }
      `);
    });
  });
});
