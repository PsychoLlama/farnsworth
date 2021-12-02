import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { FiX } from 'react-icons/fi';
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
    const { view, callActive } = this.props;
    const child = this.renderSubView();

    return child ? (
      <Container>
        {callActive ? (
          <Tabs>
            {callActive && (
              <Tab
                data-test="show-chat"
                aria-selected={view === PanelView.Chat}
                onClick={this.switchToChat}
                aria-controls={this.chatPanelId}
                onFocus={this.switchToChat}
              >
                Chat
              </Tab>
            )}
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
        ) : (
          <Header>
            <Title>Settings</Title>
            <CloseButton
              aria-label="Close panel"
              data-test="close-panel"
              onClick={this.props.close}
            >
              <FiX />
            </CloseButton>
          </Header>
        )}
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
  callActive: boolean;
  view: PanelView;
  showChat: typeof actions.panel.showChat;
  showSettings: typeof actions.panel.showSettings;
  close: typeof actions.panel.close;
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

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: ${css.color('background')};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h2`
  margin: 0;
`;

const Tabs = styled.nav.attrs({ role: 'tablist' })`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
`;

const Tab = styled(Button.Base).attrs({ role: 'tab' })`
  display: flex;
  justify-content: center;
  padding: 1rem 0;
  border-bottom: 3px solid transparent;
  font-weight: bold;
  transition-timing-function: ease-out;
  transition-property: color, background-color;
  transition-duration: 100ms;
  font-size: 100%;

  :hover,
  :focus {
    outline: none;
    background-color: ${css.color('primary-overlay')};
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

const CloseButton = styled(Button.Base)`
  display: flex;
  font-size: 1.5rem;
`;

export function mapStateToProps(state: State) {
  return {
    view: state.panel.view,
    callActive: state.call !== null,
  };
}

const mapDispatchToProps = {
  showChat: actions.panel.showChat,
  showSettings: actions.panel.showSettings,
  close: actions.panel.close,
};

export default connect(mapStateToProps, mapDispatchToProps)(Panel);
