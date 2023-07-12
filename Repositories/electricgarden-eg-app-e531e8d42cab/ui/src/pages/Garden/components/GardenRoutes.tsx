import React from 'react';
import { useSelector } from 'react-redux';
import { Route } from 'react-router';

import { selectedTeamOrUndefinedSelector } from '../selectors';
import { Garden } from './Garden';
import { NotInTeam } from './prompts/NotInTeam';

export const GardenRoutes: React.FC = () => {
    const team = useSelector(selectedTeamOrUndefinedSelector);

    return team ? <Route component={Garden} /> : <NotInTeam />;
};
