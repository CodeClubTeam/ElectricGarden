import React from 'react';
import styled from 'styled-components/macro';
import defaultProfilePic from '../../static/user.svg';
import { useAuth0 } from '../../data/react-auth0-spa';

const Image = styled.img`
    width: 50px;
    height: 50px;
    border-radius: 50%;
`;

export const UserProfilePic: React.FC = () => {
    const { user } = useAuth0();

    const url = user && user.picture ? user.picture : defaultProfilePic;
    return <Image src={url} alt="User Profile Pic" />;
};
