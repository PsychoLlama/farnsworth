import styled from 'styled-components';
import * as css from '../../utils/css';

export const Base = styled.button`
  appearance: none;
  border: none;
  color: ${css.color('text')};
  background-color: transparent;
  padding: 0;
  margin: 0;
  outline-color: ${css.color('primary')};
`;

export const Primary = styled(Base)`
  background-color: ${css.color('primary')};
  border-radius: ${css.radius};
  color: white;
  font-weight: bold;
  padding: 1rem;

  :focus,
  :hover {
    filter: brightness(80%);
    outline: none;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  :active {
    filter: brightness(70%);
  }
`;
