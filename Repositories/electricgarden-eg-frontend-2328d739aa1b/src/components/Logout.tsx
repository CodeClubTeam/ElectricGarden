import React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { createStructuredSelector } from 'reselect';

import { currentUserNameSelector, currentUserPathSelector } from '../selectors';
import { AppState } from '../types';
import { useAuth0 } from '../data/react-auth0-spa';

interface MappedProps {
    name: string;
    currentUserLink: string;
}

type Props = MappedProps & RouteComponentProps;

const Component: React.FC<Props> = ({ name, history, currentUserLink }) => {
    const { logout } = useAuth0();
    return (
        <div className="user-welcome">
            <DropdownButton id="user-button" title={`Kia ora, ${name}`}>
                <MenuItem
                    eventKey="1"
                    onClick={() => history.push(currentUserLink)}
                >
                    My Account
                </MenuItem>
                <MenuItem
                    eventKey="2"
                    onClick={() =>
                        logout!({
                            returnTo: window.location.origin,
                        })
                    }
                >
                    Logout
                </MenuItem>
            </DropdownButton>
        </div>
    );
};

const Connected = connect<MappedProps, {}, RouteComponentProps, AppState>(
    createStructuredSelector({
        name: currentUserNameSelector,
        currentUserLink: currentUserPathSelector,
    }),
)(Component);

export const Logout = withRouter(Connected);
