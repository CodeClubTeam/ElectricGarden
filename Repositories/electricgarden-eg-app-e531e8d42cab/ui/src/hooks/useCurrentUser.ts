import { useSelector } from 'react-redux';

import { currentUserSelector, currentUserRoleSelector } from '../selectors';
import { Role } from '../utils';

export const useCurrentUser = () => {
    const user = useSelector(currentUserSelector);
    return user;
};

export const useCurrentUserIsKiosk = () => {
    const role = useSelector(currentUserRoleSelector);
    return role === Role.kiosk;
};
