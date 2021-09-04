import renderer from '../../testing/renderer';
import { InviteLink, mapStateToProps } from '../invite-link';
import createStore from '../../utils/create-store';
import * as actions from '../../actions';
import { Button } from '../core';

(navigator as any).clipboard = {
  writeText: jest.fn(),
};

jest.useFakeTimers();

describe('InviteLink', () => {
  const setup = renderer(InviteLink, {
    getDefaultProps: () => ({
      dialAddress: '/bluetooth/5/p2p/hash',
      connected: true,
    }),
  });

  beforeEach(() => {
    (navigator as any).clipboard.writeText.mockClear();
  });

  it('copies the link to the clipboard', async () => {
    const { output, props } = setup();
    const { onClick } = output.find(Button.Primary).props();

    await onClick();
    output.update();

    expect(output.find(Button.Primary).text()).toBe('Copied!');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      props.dialAddress,
    );
  });

  it('dismisses the copied notice after a short time', async () => {
    const { output } = setup();
    const { onClick } = output.find(Button.Primary).props();

    await onClick();
    output.update();
    jest.runAllTimers();

    expect(output.find(Button.Primary).text()).not.toBe('Copied!');
  });

  describe('mapStateToProps', () => {
    it('returns placeholders while connecting to the relay', () => {
      const store = createStore();
      const props = mapStateToProps(store.getState());

      expect(props).toMatchObject({
        dialAddress: '',
        connected: false,
      });
    });

    it('returns the full relay address', async () => {
      const store = createStore();
      await store.dispatch(actions.connections.listen('fake-server'));
      const { relay } = store.getState();
      const props = mapStateToProps(store.getState());

      expect(props).toMatchObject({
        dialAddress: `${relay.server}/p2p-circuit/p2p/${relay.localId}`,
        connected: true,
      });
    });
  });
});
