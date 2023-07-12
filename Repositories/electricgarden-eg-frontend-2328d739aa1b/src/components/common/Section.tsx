import './section.scss';

import React from 'react';

interface SectionProps {
    header: string;
}
export default class Section extends React.PureComponent<SectionProps, {}> {
    constructor(props: SectionProps) {
        super(props);
        this.state = {};
    }
    render() {
        return (
            <div className="section">
                <div className="section-header">{this.props.header}</div>
                <div className="section-body">{this.props.children}</div>
            </div>
        );
    }
}
