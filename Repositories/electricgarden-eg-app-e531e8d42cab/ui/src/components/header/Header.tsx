import React from 'react';
import MediaQuery from 'react-responsive';
import styled from 'styled-components/macro';

import { UserProfilePic } from '../../atomic-ui/atoms/UserProfilePic';
import { useAuth0 } from '../../data/react-auth0-spa';
import imageURL from '../../static/electricgarden.png';
import { useActionContext } from '../ActionContext';
import { BURGER_MENU_MAX_WIDTH } from '../constants';
import { CurrentOrganisationName } from './CurrentOrganisationName';
import { OuterNav } from './OuterNav';

const Container = styled.div`
    height: 100px;
    text-align: center;
    display: flex;
    @media (max-width: ${BURGER_MENU_MAX_WIDTH}px) {
        height: 70px; /* logo needs the extra v space and is hidden for this screen size */
    }
`;

const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-around;
    color: #ec008c;
`;

const LogoContainer = styled.div`
    @media (max-width: ${BURGER_MENU_MAX_WIDTH}px) {
        display: none;
    }
    img {
        height: 110px;
        padding: 0 40px 20px 40px;
    }
`;

const ProfilePicContainer = styled.div`
    margin-right: 2em;
`;

export const Header: React.FC = () => {
    const { isAuthenticated } = useAuth0();
    const { loaded } = useActionContext();
    return (
        <Container>
            <LogoContainer>
                <img src={imageURL} alt="Logo" />
            </LogoContainer>
            <div className="filler"></div>
            <HeaderRight>
                <MediaQuery minDeviceWidth={700}>
                    {isAuthenticated && loaded && <CurrentOrganisationName />}
                </MediaQuery>

                {isAuthenticated && loaded && <OuterNav />}
                <MediaQuery minDeviceWidth={400}>
                    <ProfilePicContainer>
                        <UserProfilePic />
                    </ProfilePicContainer>
                </MediaQuery>
            </HeaderRight>
        </Container>
    );
};
