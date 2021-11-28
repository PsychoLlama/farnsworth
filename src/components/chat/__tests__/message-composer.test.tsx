import renderer from '../../../testing/renderer';
import { MessageComposer } from '../message-composer';

describe('MessageComposer', () => {
  const setup = renderer(MessageComposer, {
    getDefaultProps: () => ({
      // TODO
    }),
  });

  it('autosizes the input when content changes', () => {
    const { findByTestId } = setup();

    const event = { currentTarget: { style: {}, scrollHeight: 40 } };
    findByTestId('chat-message-composer').simulate('input', event);

    expect(event.currentTarget.style).toMatchObject({
      height: expect.stringContaining('40px'),
    });
  });
});
