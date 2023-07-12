import React from 'react';
import './pageHeader.scss';

export default class PageHeader extends React.PureComponent {
    render() {
        return <div className="page-header">{this.props.children}</div>;
    }
}
