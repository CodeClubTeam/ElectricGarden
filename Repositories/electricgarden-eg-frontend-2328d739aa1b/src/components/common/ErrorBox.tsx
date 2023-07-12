import './errorBox.scss';

import React from 'react';

import errorIcon from '../../static/error.svg';

export default class ErrorBox extends React.PureComponent<{}, {}> {
    render() {
        return (
            <div className="error-box">
                <img src={errorIcon} alt="Error" />
                <div>
                    <div className="error-header">ERROR</div>
                    <div className="error-body">{this.props.children}</div>
                </div>
            </div>
        );
    }
}
