import { ChatPanel, mapStateToProps } from '../chat-panel';
import renderer from '../../../testing/renderer';
import createStore from '../../../utils/create-store';

describe('ChatPanel', () => {
  const setup = renderer(ChatPanel, {
    getDefaultProps: () => ({
      showChatPanel: true,
      close: jest.fn(),
    }),
  });

  it('hides itself if the panel is disabled', () => {
    const { output: hidden } = setup({ showChatPanel: false });
    const { output: visible } = setup({ showChatPanel: true });

    expect(hidden.isEmptyRender()).toBe(true);
    expect(visible.isEmptyRender()).toBe(false);
  });

  it('closes the chat panel when clicking the close button', () => {
    const { findByTestId, props } = setup();

    findByTestId('close-chat').simulate('click');

    expect(props.close).toHaveBeenCalled();
  });

  describe('mapStateToProps', () => {
    it('grabs the correct props', () => {
      const store = createStore();
      const state = store.getState();
      const props = mapStateToProps(state);

      expect(props).toMatchObject({
        showChatPanel: false,
      });
    });
  });
});
