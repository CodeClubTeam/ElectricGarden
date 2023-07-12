import React from 'react';
import { connect, DispatchProp } from 'react-redux';

import * as actions from '../actions';
import { HttpResponseError } from '../data/server/HttpResponseError';
import { ErrorModal } from '../atomic-ui';

type Props = { children: React.ReactNode } & DispatchProp;

class AppErrorBoundary extends React.Component<Props> {
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        const { dispatch } = this.props;

        if (error instanceof HttpResponseError) {
            dispatch(actions.httpError(error));
        } else {
            dispatch(actions.uiError({ error, errorInfo }));
        }
    }

    render() {
        const { children } = this.props;
        return (
            <>
                {children}
                <ErrorModal />
            </>
        );
    }
}

export default connect()(AppErrorBoundary);
