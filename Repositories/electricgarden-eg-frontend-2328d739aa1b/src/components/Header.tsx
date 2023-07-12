import React from 'react';
import MediaQuery from 'react-responsive';

import { useAuth0 } from '../data/react-auth0-spa';
import imageURL from '../static/electricgarden.png';
import userIcon from '../static/user.svg';
import { CurrentOrganisationName } from './CurrentOrganisationName';
import { Logout } from './Logout';
import { useActionContext } from './ActionContext';

export const Header: React.FC = () => {
    const { isAuthenticated } = useAuth0();
    const { loaded } = useActionContext();
    return (
        <div className="header">
            <MediaQuery minDeviceWidth={1025}>
                <div className="logo">
                    <img src={imageURL} alt="Logo" />
                </div>
            </MediaQuery>
            <div className="filler"></div>
            <div className="header-right">
                <MediaQuery minDeviceWidth={700}>
                    {isAuthenticated && loaded && <CurrentOrganisationName />}
                </MediaQuery>
                {/* <div className="org-circle"></div> */}
                <MediaQuery minDeviceWidth={400}>
                    <img src={userIcon} alt="User Icon" />
                </MediaQuery>
                {isAuthenticated && loaded && <Logout />}
                {/* <img className="help-icon" src={helpIcon} /> */}
            </div>
        </div>
    );
};
