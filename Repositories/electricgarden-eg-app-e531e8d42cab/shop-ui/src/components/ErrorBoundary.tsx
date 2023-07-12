import React from 'react';
import { DispatchProp, connect } from 'react-redux';

import { AppAction } from '../types';
import { ErrorPrompt } from './ErrorPrompt';

type Props = { children: React.ReactNode } & DispatchProp<AppAction>;

class ErrorBoundaryComponent extends React.Component<Props> {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.dispatch({ type: 'UI_ERROR', payload: { error, errorInfo } });
  }

  render() {
    const { children } = this.props;
    return <ErrorPrompt>{children}</ErrorPrompt>;
  }
}

export const ErrorBoundary = connect()(ErrorBoundaryComponent);
