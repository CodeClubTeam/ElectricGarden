// note, needs to match src/index.tsx imports
import '../src/style.scss';

import React from 'react';
import { ThemeProvider, createGlobalStyle } from 'styled-components/macro';

import { theme } from '../src/theme';

// NOTE: copied from public/index.html
const GlobalStyle = createGlobalStyle`
    @import url('https://fonts.googleapis.com/css?family=Comfortaa:300,400,700&display=swap');

    body {
        margin: 0;
        font-family: 'Comfortaa', cursive;
        font-weight: 300;
        line-height: 1.42857143; /* bootstrap.css does this so we need to here to avoid flick on js load */
    }
`;

export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
};

export const decorators = [
    (storyFn) => (
        <ThemeProvider theme={theme}>
            <GlobalStyle />
            {storyFn()}
        </ThemeProvider>
    ),
];
