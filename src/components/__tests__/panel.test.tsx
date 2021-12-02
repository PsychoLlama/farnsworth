import renderer from '../../testing/renderer';
import { Panel, mapStateToProps } from '../panel';
import initialState, { PanelView } from '../../reducers/initial-state';
import ChatPanel from '../chat/chat-panel';
import SettingsPanel from '../settings/settings-panel';

describe('Panel', () => {
  const setup = renderer(Panel, {
    getDefaultProps: () => ({
      view: PanelView.Chat,
    }),
  });

  it('renders the correct sub-screen', () => {
    const { output: chat } = setup({ view: PanelView.Chat });
    const { output: settings } = setup({ view: PanelView.Settings });
    const { output: none } = setup({ view: PanelView.None });

    expect(chat.find(ChatPanel).exists()).toBe(true);
    expect(settings.find(SettingsPanel).exists()).toBe(true);
    expect(none.isEmptyRender()).toBe(true);
  });

  describe('mapStateToProps', () => {
    it('grabs the necessary props', () => {
      const props = mapStateToProps(initialState);

      expect(props).toMatchInlineSnapshot(`
        Object {
          "view": "none",
        }
      `);
    });
  });
});
