import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

export class MessageComposer extends React.Component {
  render() {
    return <Container>Message Composer goes Here</Container>;
  }
}

const Container = styled.div`
  padding: 0.5rem;
`;

export default connect()(MessageComposer);
