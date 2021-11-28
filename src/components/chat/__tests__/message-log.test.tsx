import renderer from '../../../testing/renderer';
import { MessageLog } from '../message-log';

describe('MessageLog', () => {
  const setup = renderer(MessageLog, {
    getDefaultProps: () => ({
      // TODO
    }),
  });

  it('renders', () => {
    expect(setup).not.toThrow();
  });
});
