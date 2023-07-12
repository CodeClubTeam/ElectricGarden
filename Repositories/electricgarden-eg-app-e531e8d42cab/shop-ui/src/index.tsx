import React from 'react';
import ReactDOM from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { createGlobalStyle } from 'styled-components/macro';

import { InlineApp } from './components/InlineApp';
import { handleAnyCreditCardPaymentRedirect } from './pages/payment';
import { createStore } from './store';

const store = createStore();
handleAnyCreditCardPaymentRedirect(store.dispatch);

const GlobalStyle = createGlobalStyle`
  body {
    --link-color: #2ed03c;

    a {
      color: var(--link-color);
    }
  }

  .validation-error {
    color: red;
  }
`;

ReactDOM.render(
  <>
    <GlobalStyle />
    <ReduxProvider store={store}>
      <InlineApp />
    </ReduxProvider>
  </>,
  document.getElementById('egStoreRoot'),
);
