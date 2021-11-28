import renderer from '../../../testing/renderer';
import { MessageComposer } from '../message-composer';

describe('MessageComposer', () => {
  const setup = renderer(MessageComposer, {
    getDefaultProps: () => ({
      // TODO
    }),
  });

  it('renders', () => {
    expect(setup).not.toThrow();
  });
});
