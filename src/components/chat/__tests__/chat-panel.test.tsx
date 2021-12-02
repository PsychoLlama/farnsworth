import { ChatPanel } from '../chat-panel';
import renderer from '../../../testing/renderer';

describe('ChatPanel', () => {
  const setup = renderer(ChatPanel, {
    getDefaultProps: () => ({
      panelId: 'chat-panel',
    }),
  });

  it('renders', () => {
    expect(setup).not.toThrow();
  });
});
