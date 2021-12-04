import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Button } from '../core';

export class IceServer extends React.Component<Props> {
  render() {
    return (
      <Container>
        Future home of ICE Server editing panel.
        <Buttons>
          <Button.Subtle data-test="cancel-button" onClick={this.props.onClose}>
            Cancel
          </Button.Subtle>

          <Button.Primary data-test="save-button">Save</Button.Primary>
        </Buttons>
      </Container>
    );
  }
}

interface Props {
  id: number;
  onClose(): unknown;
}

const Container = styled.div`
  display: grid;
  padding: 1rem;
  gap: 1rem;
`;

const Buttons = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: min-content;
  justify-content: end;
  gap: 1rem;
`;

export default connect()(IceServer);
