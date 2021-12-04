import styled from 'styled-components';
import * as css from '../../utils/css';

const TextInput = styled.input`
  appearance: none;
  padding: 0.5rem;
  border-radius: ${css.radius};
  border: 1px solid ${css.color('foreground')};
  background-color: ${css.color('background')};
  color: ${css.color('foreground')};

  ::placeholder {
    font-style: italic;
  }

  :hover,
  :focus {
    border-color: ${css.color('primary')};
    outline: none;
  }
`;

export default TextInput;
