import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import * as css from '../../utils/css';

/**
 * This supports a cheap implementation of an autosized multiline input
 * element. These constants provide an exact value for a line-based
 * `max-height` clamp.
 */
const BORDER_WIDTH = '1px';
const INPUT_PADDING = '0.5rem';
const FONT_SIZE = '14px';
const LINE_HEIGHT = '1.2';

export class MessageComposer extends React.Component {
  render() {
    return (
      <Container>
        <Input
          data-test="chat-message-composer"
          placeholder="Type a message"
          onInput={this.autosize}
          rows={1}
        />
      </Container>
    );
  }

  autosize = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ref = event.currentTarget;
    ref.style.height = 'auto'; // Handles resizing when lines are deleted.
    ref.style.height = `calc(${ref.scrollHeight}px + ${BORDER_WIDTH} * 2)`;
  };
}

const Container = styled.div`
  padding: 0.5rem;
`;

const Input = styled.textarea`
  background-color: ${css.color('background')};
  color: ${css.color('text')};
  border: ${BORDER_WIDTH} solid ${css.color('foreground')};
  border-radius: ${css.radius};
  margin: 0;
  resize: none;
  width: 100%;
  box-sizing: border-box;

  font-family: sans-serif;
  font-size: ${FONT_SIZE};
  line-height: ${LINE_HEIGHT};
  padding: ${INPUT_PADDING};

  // Max out at 5 lines of input, then scroll.
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(
    ${BORDER_WIDTH} * 2 + ${INPUT_PADDING} * 2 + ${FONT_SIZE} * ${LINE_HEIGHT} *
      5
  );

  :hover,
  :focus {
    outline: none;
    border-color: ${css.color('primary')};
  }
`;

export default connect()(MessageComposer);
