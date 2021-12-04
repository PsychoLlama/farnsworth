import React from 'react';
import styled, { StyledComponentProps } from 'styled-components';
import { v4 as uuid } from 'uuid';
import * as css from '../../utils/css';

/** A checkbox masquerading as a switch. */
export default class Switch extends React.Component<Props> {
  inputId = uuid();

  render() {
    const { children, value, className, ...others } = this.props;

    return (
      <Container className={className}>
        <Checkbox
          {...others}
          id={this.inputId}
          checked={value}
          type="checkbox"
        />
        <Label htmlFor={this.inputId}>{children}</Label>
      </Container>
    );
  }
}

interface Props
  extends Omit<
    StyledComponentProps<'input', object, object, 'type'>,
    'type' | 'children' | 'value'
  > {
  children: React.ReactNode;
  value: boolean;
}

const SWITCH_SIZE = '0.8rem';

const Container = styled.div`
  display: flex;
  position: relative;
  align-items: center;
  margin: 1rem 0;
`;

const Checkbox = styled.input`
  appearance: none;
  display: flex;
  height: ${SWITCH_SIZE};
  width: calc(${SWITCH_SIZE} * 2);
  border-radius: calc(${SWITCH_SIZE} * 2);
  flex-shrink: 0;
  margin: 0;
  padding: 0.15rem;
  background-color: ${css.color('primary')};
  box-sizing: content-box;
  transition: background-color 150ms;

  :disabled {
    background-color: ${css.color('white')};
  }

  // Invisible space. Animates the knob rightward.
  ::before {
    content: '';
    flex-grow: 0;
    transition: flex-grow 150ms;
  }

  ::after {
    content: '';
    width: ${SWITCH_SIZE};
    border-radius: ${SWITCH_SIZE};
    background-color: ${css.color('background')};
  }

  :checked {
    background-color: ${css.color('tertiary')};

    ::before {
      flex-grow: 1;
    }
  }
`;

const Label = styled.label`
  margin-left: 0.5rem;
`;
