import { useSelector } from 'react-redux';

import { growablesForSelectedTeamSelector } from '../selectors';

export const useDefaultGrowableId = () => {
    // with sticky we'll return the one in state for the selected team
    const growables = useSelector(growablesForSelectedTeamSelector);
    return growables.length ? growables[0].id : undefined;
};
