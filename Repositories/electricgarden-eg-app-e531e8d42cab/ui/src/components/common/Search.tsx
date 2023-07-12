import './search.scss';

import React from 'react';

import searchIcon from '../../static/search.svg';

export default class Search extends React.PureComponent<
    { placeholder?: string },
    {}
> {
    render() {
        return (
            <div className="search">
                <input placeholder={this.props.placeholder} type="text">
                    {this.props.children}
                </input>
                <span className="search-icon">
                    <img src={searchIcon} alt="Search" />
                </span>
            </div>
        );
    }
}
