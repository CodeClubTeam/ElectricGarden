import React from 'react';

import { ErrorBoundary } from './ErrorBoundary';
import { Router } from './Router';

export const InlineApp: React.FC = () => (
  <ErrorBoundary>
    <Router />
  </ErrorBoundary>
);
