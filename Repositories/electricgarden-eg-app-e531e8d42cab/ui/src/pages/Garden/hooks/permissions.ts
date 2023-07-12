import { useSelector } from 'react-redux';

import { useCanHaveRole } from '../../../hooks';
import { Role } from '../../../utils';
import { selectedTeamOrUndefinedSelector } from '../selectors';

export const useCanAddGrowable = () => {
    const team = useSelector(selectedTeamOrUndefinedSelector);
    const canHaveRole = useCanHaveRole();

    return team && canHaveRole(Role.leader);
};

export const useCanEditGrowable = () => {
    return useCanAddGrowable();
};

export const useCanDeleteGrowable = () => {
    return useCanEditGrowable();
};
