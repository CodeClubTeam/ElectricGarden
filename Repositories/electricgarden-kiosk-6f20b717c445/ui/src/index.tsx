import React from "react";
import ReactDOM from "react-dom";
import { ThemeProvider, createGlobalStyle } from "styled-components/macro";
import { App } from "./App";
import { theme } from "./theme";

const GlobalStyle = createGlobalStyle`
:root {
    box-sizing: border-box;
}

*,
::before,
::after {
    box-sizing: inherit;
}

// note changes may need to be mirrored for pre-load screen css in public/index.html
body {
    margin: 0;
    --font-weight-light: 300;
    font-family: 'Comfortaa', cursive;
    word-wrap: break-word;
    font-weight: var(--font-weight-light);
    font-size: 14px;
    color: #6d6e70;
}

label {
    padding-right: 0.25em;
}


a,
a:visited,
a:active,
a:focus {
    color: #53b848;
    text-decoration: none;
}


hr {
    color: #a7a9ac;
    margin: 10px 0;
}

textarea {
    background: #f7f7f7;
    border: 1px solid #bdbdbd;
    border-radius: 4px;
}
`;

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root"),
);
