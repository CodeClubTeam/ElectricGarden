import { useSelector } from 'react-redux';

import { canHaveRoleSelector } from '../selectors';

export const useCanHaveRole = () => {
    return useSelector(canHaveRoleSelector);
};
