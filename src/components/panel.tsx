import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { State, PanelView } from '../reducers/initial-state';
import ChatPanel from './chat/chat-panel';
import SettingsPanel from './settings/settings-panel';
import * as css from '../utils/css';
import * as actions from '../actions';

export class Panel extends React.Component<Props> {
  render() {
    const { view } = this.props;
    const child = this.renderSubView();

    return child ? (
      <Container>
        <Tabs>
          <Tab
            data-test="show-chat"
            data-active={view === PanelView.Chat}
            onClick={this.props.showChat}
          >
            Chat
          </Tab>
          <Tab
            data-test="show-settings"
            data-active={view === PanelView.Settings}
            onClick={this.props.showSettings}
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
        return <ChatPanel />;
      case PanelView.Settings:
        return <SettingsPanel />;
      default:
        return null;
    }
  }
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

const Tabs = styled.nav`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
`;

const Tab = styled.a`
  display: flex;
  justify-content: center;
  padding: 1rem 0;
  flex-grow: 1;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  font-weight: bold;
  transition: color 100ms ease-out;

  &[data-active='true'] {
    border-color: ${css.color('primary')};
    color: ${css.color('primary')};
  }

  &[data-active='false'] {
    border-color: ${css.color('white')};
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
