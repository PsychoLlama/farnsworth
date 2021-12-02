import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { State, PanelView } from '../reducers/initial-state';
import { v4 as uuid } from 'uuid';
import ChatPanel from './chat/chat-panel';
import SettingsPanel from './settings/settings-panel';
import * as css from '../utils/css';
import * as actions from '../actions';
import { Button } from './core';

export class Panel extends React.Component<Props> {
  chatPanelId = uuid();
  settingsPanelId = uuid();

  render() {
    const { view } = this.props;
    const child = this.renderSubView();

    return child ? (
      <Container>
        <Tabs>
          <Tab
            data-test="show-chat"
            aria-selected={view === PanelView.Chat}
            onClick={this.switchToChat}
            aria-controls={this.chatPanelId}
            onFocus={this.switchToChat}
          >
            Chat
          </Tab>
          <Tab
            data-test="show-settings"
            aria-selected={view === PanelView.Settings}
            onClick={this.switchToSettings}
            aria-controls={this.settingsPanelId}
            onFocus={this.switchToSettings}
          >
            Settings
          </Tab>
        </Tabs>
        {child}
      </Container>
    ) : null;
  }

  renderSubView() {
    switch (this.props.view) {
      case PanelView.Chat:
        return <ChatPanel panelId={this.chatPanelId} />;
      case PanelView.Settings:
        return <SettingsPanel panelId={this.settingsPanelId} />;
      default:
        return null;
    }
  }

  switchToChat = () => {
    if (this.props.view !== PanelView.Chat) {
      this.props.showChat();
    }
  };

  switchToSettings = () => {
    if (this.props.view !== PanelView.Settings) {
      this.props.showSettings();
    }
  };
}

interface Props {
  view: PanelView;
  showChat: typeof actions.panel.showChat;
  showSettings: typeof actions.panel.showSettings;
}

const Container = styled.aside.attrs({ role: 'complementary' })`
  display: flex;
  background-color: ${css.color('background')};
  flex-direction: column;
  min-width: 315px;
  box-shadow: inset 0 -4px 4px -4px rgba(0, 0, 0, 0.4);

  @media screen and (max-width: ${css.breakpoint.mobile}) {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${css.color('overlay')};
    min-width: 0;
    box-shadow: none;
  }
`;

const Tabs = styled.nav.attrs({ role: 'tablist' })`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
`;

const Tab = styled(Button.Base).attrs({ role: 'tab' })`
  display: flex;
  justify-content: center;
  padding: 1rem 0;
  flex-grow: 1;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  font-weight: bold;
  transition-timing-function: ease-out;
  transition-property: color, background-color;
  transition-duration: 100ms;
  font-size: 100%;

  :focus {
    outline: none;
  }

  &[aria-selected='true'] {
    border-color: ${css.color('primary')};
    color: ${css.color('primary')};
    background-color: ${css.color('primary-overlay')};
  }

  &[aria-selected='false'] {
    border-color: ${css.color('primary-overlay')};
  }
`;

export function mapStateToProps(state: State) {
  return {
    view: state.panel.view,
  };
}

const mapDispatchToProps = {
  showChat: actions.panel.showChat,
  showSettings: actions.panel.showSettings,
};

export default connect(mapStateToProps, mapDispatchToProps)(Panel);
