import renderer from '../../../testing/renderer';
import SettingsPanel from '../settings-panel';

describe('SettingsPanel', () => {
  const setup = renderer(SettingsPanel, {
    getDefaultProps: () => ({
      // TODO
    }),
  });

  it('renders', () => {
    expect(setup).not.toThrow();
  });
});
