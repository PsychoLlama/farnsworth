import { FiCheck } from 'react-icons/fi';
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

  it('shows the invite URL', () => {
    const { findByTestId, props } = setup();

    const { value } = findByTestId('invite-code').props();

    expect(value).toBe(`${location.origin}/#/call/${props.localId}`);
  });

  it('copies the code to the clipboard', async () => {
    const { findByTestId, output, props } = setup();
    const { onClick } = findByTestId('copy-invite-code').props();

    await onClick();
    output.update();

    expect(findByTestId('icon-success').exists()).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      `${location.origin}/#/call/${props.localId}`,
    );
  });

  it('selects all text when the input is focused', () => {
    const { findByTestId } = setup();

    const ref = { select: jest.fn() };
    findByTestId('invite-code').simulate('focus', { currentTarget: ref });

    expect(ref.select).toHaveBeenCalled();
  });

  it('dismisses the copied notice after a short time', async () => {
    const { findByTestId, output } = setup();
    const { onClick } = findByTestId('copy-invite-code').props();

    await onClick();
    output.update();
    jest.runAllTimers();

    expect(findByTestId('icon-success').exists()).toBe(false);
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
