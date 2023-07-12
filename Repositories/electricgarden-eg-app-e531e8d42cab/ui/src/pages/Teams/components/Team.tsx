import 'react-virtualized/styles.css';

import React from 'react';
import { SplitButton, Dropdown } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';

import { PageHeader, Section } from '../../../components/common';
import { useApi } from '../../../data/ApiProvider';
import { formatDateTime } from '../../../utils';
import * as actions from '../actions';
import {
    teamDetailSelectorCreate,
    teamForIdSelectorCreate,
} from '../selectors';
import { ConfirmDialog } from '../../../atomic-ui';

interface Props extends RouteComponentProps<{ teamId: string }> {}

export const Team: React.FC<Props> = ({
    match: {
        params: { teamId },
    },
    history,
}) => {
    const team = useSelector(
        teamDetailSelectorCreate(teamForIdSelectorCreate(teamId)),
    );

    const dispatch = useDispatch();
    const api = useApi();

    const handleDelete = React.useCallback(() => {
        api.team.delete(teamId).then(() => {
            dispatch(actions.removedTeam(teamId));
            history.push('../');
        });
    }, [api.team, dispatch, history, teamId]);

    const handleEdit = React.useCallback(() => {
        history.push('./edit');
    }, [history]);

    if (!team) {
        return <div>Team not found.</div>;
    }
    return (
        <div>
            <PageHeader>
                <div style={{ display: 'flex' }}>
                    <h2>{team.name}</h2>
                    <div className="filler"></div>
                    <SplitButton
                        title="edit"
                        id="team-edit"
                        variant="primary"
                        onClick={handleEdit}
                    >
                        <ConfirmDialog
                            body={<p>Delete team {team.name}?</p>}
                            onConfirm={handleDelete}
                        >
                            <Dropdown.Item eventKey="4" onClick={handleDelete}>
                                Delete
                            </Dropdown.Item>
                        </ConfirmDialog>
                    </SplitButton>
                </div>
            </PageHeader>
            <Section header="Details">
                <table style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            {/* <th>Created by</th> */}
                            <th>Added On</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{team.name}</td>
                            {/* <td>[NOT IN DATA]</td> */}
                            <td>{formatDateTime(team.createdOn)}</td>
                        </tr>
                    </tbody>
                </table>
                <hr />
            </Section>
            <Section header="Leaders">
                {/* // todo: get Emma to design something better */}
                <p
                    style={{
                        whiteSpace: 'pre-line',
                        maxHeight: '130px',
                        overflow: 'auto',
                        columnCount: 4,
                    }}
                >
                    • {team.leaders.map(({ name }) => name).join('\n• ')}
                </p>
            </Section>
            <Section header="Members">
                <p
                    style={{
                        whiteSpace: 'pre-line',
                        maxHeight: '130px',
                        overflow: 'auto',
                        columnCount: 4,
                    }}
                >
                    • {team.members.map(({ name }) => name).join('\n• ')}
                </p>
            </Section>
        </div>
    );
};
