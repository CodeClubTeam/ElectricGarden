import { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';

import { useAuth0 } from '../../data/react-auth0-spa';
import { useCanHaveRole } from '../../hooks';
import {
    createAppStructuredSelector,
    currentUserAdminPathSelector,
    currentUserNameSelector,
} from '../../selectors';
import { Role } from '../../utils';

const Container = styled.div`
    font-size: 24px;
    margin: 0 10px;
    .btn {
        background-color: transparent;
        color: #ec008c;
        padding: 0 10px;
        &:hover {
            background-color: transparent;
        }
    }
    .dropdown {
        margin: 0;
    }
`;

export const OuterNav = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const { logout } = useAuth0();
    const canHaveRole = useCanHaveRole();
    const { name, currentUserAdminPath } = useSelector(
        createAppStructuredSelector({
            name: currentUserNameSelector,
            currentUserAdminPath: currentUserAdminPathSelector,
        }),
    );

    return (
        <Container>
            <Dropdown
                id="user-button"
                navbar
                show={showDropdown}
                onToggle={(_isOpen, event) => {
                    event?.stopPropagation?.(); // workaround for bug with react-bootstrap modal blocking dropdown from working after first open
                    setShowDropdown(!showDropdown);
                }}
            >
                <Dropdown.Toggle id="waefew">Kia ora, {name}</Dropdown.Toggle>
                <Dropdown.Menu>
                    {canHaveRole(Role.admin) && (
                        <Dropdown.Item as={Link} to={currentUserAdminPath}>
                            My Account
                        </Dropdown.Item>
                    )}
                    <Dropdown.Item onSelect={() => logout!()}>
                        Logout
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </Container>
    );
};
