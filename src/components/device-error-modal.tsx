import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { FiAlertTriangle } from 'react-icons/fi';
import { State } from '../reducers/initial-state';
import { DeviceError } from '../utils/constants';
import * as css from '../utils/css';
import { Button } from './core';
import * as actions from '../actions';
import EventObserver from './event-observer';

export class DeviceErrorModal extends React.Component<Props> {
  render() {
    const { deviceError } = this.props;

    if (deviceError === null) {
      return null;
    }

    return (
      <EventObserver
        eventName="keydown"
        onEvent={this.detectEscape}
        target={document.body}
        data-test="event-observer"
      >
        <Backdrop>
          <Dialog>
            <Title>
              Media Error <FiAlertTriangle />
            </Title>

            <Content>
              {this.renderErrorText()}
              <CloseButton
                autoFocus
                data-test="close-button"
                onClick={this.props.close}
              >
                Close
              </CloseButton>
            </Content>
          </Dialog>
        </Backdrop>
      </EventObserver>
    );
  }

  renderErrorText() {
    switch (this.props.deviceError) {
      case DeviceError.NotAllowed:
        return (
          <Description data-test="error-text">
            Your browser won&apos;t let us have access to the microphone or
            camera.
          </Description>
        );
      default:
        return (
          <Description data-test="error-text">
            Huh. Something went wrong while trying to get camera/microphone
            access.
          </Description>
        );
    }
  }

  detectEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') this.props.close();
  };
}

interface Props {
  deviceError: null | DeviceError;
  close: typeof actions.devices.closeErrorModal;
}

const Backdrop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${css.color('overlay')};
`;

const Dialog = styled.section`
  background-color: ${css.color('background')};
  min-width: 30%;
  max-width: 50%;
  overflow: hidden;
  border-radius: ${css.radius};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  @media screen and (max-width: ${css.breakpoint.mobile}) {
    max-width: none;
    width: 90%;
  }
`;

const Title = styled.h2`
  background-color: ${css.color('secondary')};
  color: ${css.color('background')};
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
  padding: 1rem;
`;

const Content = styled.div`
  display: grid;
  gap: 1rem;
  padding: 1rem;
`;

const Description = styled.p`
  margin: 0;
`;

const CloseButton = styled(Button.Primary)`
  justify-self: end;
`;

export function mapStateToProps(state: State) {
  return {
    deviceError: state.sources.error,
  };
}

const mapDispatchToProps = {
  close: actions.devices.closeErrorModal,
};

export default connect(mapStateToProps, mapDispatchToProps)(DeviceErrorModal);
