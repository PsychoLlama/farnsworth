import { ChatPanel } from '../chat-panel';
import renderer from '../../../testing/renderer';

describe('ChatPanel', () => {
  const setup = renderer(ChatPanel, {
    getDefaultProps: () => ({
      close: jest.fn(),
    }),
  });

  it('closes the chat panel when clicking the close button', () => {
    const { findByTestId, props } = setup();

    findByTestId('close-chat').simulate('click');

    expect(props.close).toHaveBeenCalled();
  });
});
