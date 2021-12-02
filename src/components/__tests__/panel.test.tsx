import renderer from '../../testing/renderer';
import { Panel, mapStateToProps } from '../panel';
import initialState, { PanelView } from '../../reducers/initial-state';
import ChatPanel from '../chat/chat-panel';
import SettingsPanel from '../settings/settings-panel';

describe('Panel', () => {
  const setup = renderer(Panel, {
    getDefaultProps: () => ({
      view: PanelView.Chat,
      showChat: jest.fn(),
      showSettings: jest.fn(),
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

  it('switches tabs when you click the other tab', () => {
    const { output, findByTestId, props } = setup({
      view: PanelView.Settings,
    });

    findByTestId('show-chat').simulate('click');
    expect(props.showChat).toHaveBeenCalled();

    output.setProps({ view: PanelView.Chat });

    findByTestId('show-settings').simulate('click');
    expect(props.showSettings).toHaveBeenCalled();
  });

  it('indicates which panel is active', () => {
    const { findByTestId: chat } = setup({ view: PanelView.Chat });
    const { findByTestId: settings } = setup({ view: PanelView.Settings });

    expect(chat('show-chat').prop('aria-selected')).toBe(true);
    expect(settings('show-settings').prop('aria-selected')).toBe(true);
  });

  it('opens the corresponding panel on focus', () => {
    const { output, findByTestId, props } = setup({ view: PanelView.Chat });

    findByTestId('show-settings').simulate('focus');
    expect(props.showSettings).toHaveBeenCalled();

    output.setProps({ view: PanelView.Settings });

    findByTestId('show-chat').simulate('focus');
    expect(props.showChat).toHaveBeenCalled();
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
