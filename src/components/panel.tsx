import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { State, PanelView } from '../reducers/initial-state';
import ChatPanel from './chat/chat-panel';
import SettingsPanel from './settings/settings-panel';
import * as css from '../utils/css';

export class Panel extends React.Component<Props> {
  render() {
    const child = this.renderSubView();

    return child ? <Container>{child}</Container> : null;
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

export function mapStateToProps(state: State) {
  return {
    view: state.panel.view,
  };
}

export default connect(mapStateToProps)(Panel);
