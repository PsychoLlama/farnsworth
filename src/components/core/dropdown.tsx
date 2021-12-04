import styled from 'styled-components';
import * as css from '../../utils/css';

// Hold my beer.
const Dropdown = styled.select`
  appearance: none;
  border-radius: ${css.radius};
  border: 1px solid ${css.color('foreground')};
  background-color: ${css.color('background')};
  box-sizing: border-box;
  padding: 0.5rem 0.25rem;
  color: ${css.color('text')};
  font-size: 85%;

  :hover:not(:disabled),
  :focus:not(:disabled) {
    border-color: ${css.color('primary')};
    outline: none;
  }

  :disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default Dropdown;
