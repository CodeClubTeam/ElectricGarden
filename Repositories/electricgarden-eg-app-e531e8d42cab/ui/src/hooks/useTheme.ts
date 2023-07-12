import React from 'react';
import { ThemeContext } from 'styled-components/macro';

export const useTheme = () => React.useContext(ThemeContext);
