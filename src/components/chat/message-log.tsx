import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

export class MessageLog extends React.Component {
  render() {
    return (
      <Container aria-atomic aria-live="polite">
        Message Log goes Here
      </Container>
    );
  }
}

const Container = styled.ol.attrs({ role: 'log' })`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin: 0;
  padding: 0.5rem;
`;

export default connect()(MessageLog);
