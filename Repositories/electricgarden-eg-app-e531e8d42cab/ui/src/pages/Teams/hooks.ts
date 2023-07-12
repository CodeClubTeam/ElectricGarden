import { useDispatch } from 'react-redux';

import { useFormSubmitHandler } from '../../hooks';
import * as actions from './actions';
import { TeamFormValues } from './types';

type Options = {
    onCompleted?: () => void;
};

export const useTeamAdd = ({ onCompleted }: Options = {}) => {
    const dispatch = useDispatch();

    return useFormSubmitHandler<TeamFormValues, ServerTeam>(
        ({ name, leaderUserIds }, api) =>
            api.team.create({
                name: name,
                memberships: leaderUserIds.map((userId) => ({
                    userId: userId,
                    role: 'leader',
                })),
            }),
        {
            onSuccess: (savedTeam) => {
                dispatch(actions.updatedOrCreatedTeam(savedTeam));
                onCompleted && onCompleted();
            },
        },
    );
};
