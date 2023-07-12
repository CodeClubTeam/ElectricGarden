import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components/macro';

import {
    createAppStructuredSelector,
    growerTeamsSelector,
} from '../../../../selectors';
import * as actions from '../../actions';
import { selectedTeamSelector } from '../../selectors';
import { Select } from '../../../../atomic-ui/atoms/Select';

const Header = styled.h1``;

export const TeamSelector: React.FC = () => {
    const [expanded, setExpanded] = useState(false);
    const dispatch = useDispatch();
    const { teams, selectedTeam } = useSelector(
        createAppStructuredSelector({
            teams: growerTeamsSelector,
            selectedTeam: selectedTeamSelector,
        }),
    );
    const history = useHistory();

    const haveTeams = teams.length > 1;

    const handleHeaderClick = useCallback(
        (e: React.MouseEvent<HTMLHeadingElement, MouseEvent>) => {
            if (!haveTeams) {
                return;
            }
            if (!expanded) {
                setExpanded(true);
            }
        },
        [expanded, haveTeams],
    );

    const handleSelectChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            dispatch(actions.selectTeam({ id: e.target.value }));
            setExpanded(false);
            history.push('/garden');
        },
        [dispatch, history],
    );

    return (
        <Header
            onClick={handleHeaderClick}
            style={{ cursor: haveTeams ? 'pointer' : undefined }}
            title={haveTeams ? 'Click to select another team' : undefined}
        >
            {!expanded && selectedTeam.name}
            {expanded && (
                <Select value={selectedTeam.id} onChange={handleSelectChange}>
                    {teams.map(({ id, name }) => (
                        <option key={id} value={id}>
                            {name}
                        </option>
                    ))}
                </Select>
            )}
        </Header>
    );
};
