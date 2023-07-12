import './navbar.scss';

import React from 'react';
import { Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

import { useAuth0 } from '../data/react-auth0-spa';
import dashboardIcon from '../static/dashboard.svg';
import faqIcon from '../static/faq.svg';
import hardwareIcon from '../static/hardware.svg';
import helpIcon from '../static/help.svg';
import myOrganisationIcon from '../static/my-organisation.svg';
import usersIcon from '../static/users.svg';

const Navbar: React.FC = () => {
    const { isAuthenticated } = useAuth0();
    return isAuthenticated ? <Normal /> : <LoginOnly />;
};

// had to add alt attribute to icon image for lint rule but really this should be in CSS
const Normal: React.FC = () => (
    <div className="nav-bar">
        <div className="nav-items">
            <div className="nav-item large-nav-item">
                <NavLink exact to="/">
                    <img src={dashboardIcon} alt="Dashboard" />
                    Dashboard
                </NavLink>
            </div>
            <div className="nav-item">
                <NavLink to="/users">
                    <img src={usersIcon} alt="Users" />
                    Users
                </NavLink>
            </div>
            {/* <div className="nav-item"><NavLink to="/teams"><img src={teamsIcon} />Teams</NavLink></div> */}
            <div className="nav-item">
                <NavLink to="/hardware">
                    <img src={hardwareIcon} alt="Hardware" />
                    Hardware
                </NavLink>
            </div>
            <div className="nav-item">
                <NavLink to="/organisation">
                    <img src={myOrganisationIcon} alt="My Organisation" />
                    My Organisation
                </NavLink>
            </div>
        </div>
        <div className="filler"></div>
        <div className="nav-footer">
            <div className="nav-footer-item">
                <a href="http://help.electricgarden.nz/">
                    <img src={helpIcon} alt="Help" />
                    Help
                </a>
            </div>
            {/* <div className="nav-footer-item">{name}</div> */}
            {/* <div className="privacy-policy">Electric Garden Privacy Policy</div> */}
        </div>
    </div>
);

const LoginOnly = () => {
    const { loginWithPopup, loginWithRedirect } = useAuth0();
    if (!loginWithPopup || !loginWithRedirect) {
        return null;
    }
    return (
        <div className="nav-bar">
            <div className="nav-items">
                <div className="nav-item large-nav-item">
                    <Button
                        onClick={() =>
                            loginWithPopup({
                                connection: 'google-oauth2',
                            })
                        }
                    >
                        Login with Google
                    </Button>
                    <Button
                        onClick={() =>
                            loginWithPopup({
                                connection: 'windowslive',
                            })
                        }
                    >
                        Login with Microsoft
                    </Button>
                    <Button
                        onClick={() =>
                            loginWithRedirect({
                                redirect_uri: window.location.href,
                            })
                        }
                    >
                        Go to Auth0 Login
                    </Button>
                </div>
            </div>
            <div className="filler"></div>
            <div className="nav-footer">
                <div className="nav-footer-item">
                    <img src={faqIcon} alt="FAQ" />
                    FAQs
                </div>
            </div>
        </div>
    );
};

export default Navbar;
