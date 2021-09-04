import FreeformInput from 'freeform-input';
import styled from 'styled-components';
import * as css from '../../utils/css';

export default styled(FreeformInput)`
  padding: 0.5rem;
  color: ${css.color('text')};
  border-radius: ${css.radius};
  border: 1px solid ${css.color('foreground')};
  width: 100%;

  :hover,
  :focus {
    border-color: ${css.color('primary')};
    outline: 1px solid ${css.color('primary')};
  }
`;
