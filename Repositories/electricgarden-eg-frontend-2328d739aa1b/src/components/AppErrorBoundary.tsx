import React from 'react';
import { connect } from 'react-redux';

import { createAppStructuredSelector, errorSelector } from '../selectors';

class AppErrorBoundary extends React.Component<Props, { hasError: boolean }> {
    state = { hasError: false };

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // TODO: dispatch to redux store so can be handled and dismissed same way as
        // api errors
        this.setState({ hasError: true });
    }

    render() {
        if (this.state.hasError || this.props.error) {
            // TODO: use popup and expose dismiss
            return <h1>Something went wrong.</h1>;
        }
        return this.props.children;
    }
}

const connector = connect(
    createAppStructuredSelector({
        error: errorSelector,
    }),
);

type Props = ExtractProps<typeof connector>;

export default connector(AppErrorBoundary);
