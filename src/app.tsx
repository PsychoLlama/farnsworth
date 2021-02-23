import DOM from 'react-dom';
import React from 'react';
import styled from 'styled-components';
import { Provider as ReduxProvider } from 'react-redux';
import createStore from './utils/create-store';

/**
 * First, let me say that yes, I'm insane. But the insanity has reason.
 * Content should always fill available space, and the body's default styles
 * don't lend well. This essentially redefines the body container to be
 * perfectly sized to the available space.
 *
 * If this ends up causing trouble, it may be preferable to add flex displays
 * at every parent element.
 */
const Viewport = styled.div`
  display: flex;
  flex-direction: column;
  position: fixed;
  overflow: auto;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

DOM.render(
  <React.StrictMode>
    <ReduxProvider store={createStore()}>
      <Viewport>
        <h1>Hello, world</h1>
      </Viewport>
    </ReduxProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
