import DOM from 'react-dom';
import React from 'react';
import styled from 'styled-components';
import { Provider as ReduxProvider } from 'react-redux';
import store from './utils/redux-store';
import { exportToCss, OneDark, OneLight } from './utils/themes';
import App from './components/app';
import ReduxRouter from './utils/router';

ReduxRouter.init({
  '/': { effect: null },
});

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

  // App-wide theme settings.
  ${exportToCss(OneDark)}

  @media (prefers-color-scheme: light) {
    ${exportToCss(OneLight)}
  }

  background-color: var(--color-background);
  color: var(--color-text);
`;

DOM.render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <Viewport>
        <App />
      </Viewport>
    </ReduxProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
