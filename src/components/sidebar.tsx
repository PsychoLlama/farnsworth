import React from 'react';
import styled from 'styled-components';
import Statusbar from './statusbar';

export default class Sidebar extends React.Component {
  render() {
    return (
      <Container>
        <Statusbar />
      </Container>
    );
  }
}

// TODO: Ensure main video area has `main` role. I haven't written it yet.
const Container = styled.aside.attrs({ role: 'complementary' })`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;
