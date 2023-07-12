import React from 'react';
import { Dropdown, DropdownButton, FormControl } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import styled from 'styled-components/macro';

import { Button } from '../../../atomic-ui';
import { PageHeader, Section } from '../../../components/common';
import { useApi } from '../../../data/ApiProvider';
import { useCanHaveRole } from '../../../hooks';
import {
    createAppStructuredSelector,
    currentUserRolesSelector,
    currentUserSelector,
} from '../../../selectors';
import userIcon from '../../../static/user-single.svg';
import { formatDateTime, Role, Status } from '../../../utils';
import { ensureOrganisationsFetched } from '../../Organisation';
import * as actions from '../actions';
import {
    userForIdOrUndefinedSelectorCreate,
    userIdMatchesCurrentSelectorCreate,
} from '../selectors';
import { ensureUsersFetched } from './ensureUsersFetched';

const UserDetailsTable = styled.table`
    td {
        vertical-align: top;
    }
`;

interface OwnProps extends RouteComponentProps<{ userId: string }> {}

const UserComponent: React.FC<OwnProps> = ({ match }) => {
    const { userId } = match.params;

    const { orgUser, currentUser, isMyAccount, roles } = useSelector(
        createAppStructuredSelector({
            orgUser: userForIdOrUndefinedSelectorCreate(userId),
            isMyAccount: userIdMatchesCurrentSelectorCreate(userId),
            currentUser: currentUserSelector,
            roles: currentUserRolesSelector,
            // teams: teamsSelector,
        }),
    );

    const savedUser =
        orgUser || (currentUser.role === 'su' ? currentUser : undefined);

    const dispatch = useDispatch();
    const api = useApi();

    const [editingUser, setEditingUser] = React.useState<
        ServerUser | undefined
    >();
    const [submitting, setSubmitting] = React.useState(false);

    const user = editingUser || savedUser;

    const canHaveRole = useCanHaveRole();

    const handleSaveOrEdit = React.useCallback(() => {
        const save = async (userToSave: ServerUser) => {
            setSubmitting(true);
            try {
                const updatedUser = await api.user.update(user.id, userToSave);

                dispatch(actions.updatedOrCreatedUser(updatedUser));
            } finally {
                setSubmitting(false);
            }
        };
        if (editingUser) {
            save(editingUser).finally(() => {
                setEditingUser(undefined);
            });
        } else {
            setEditingUser(savedUser);
        }
    }, [api.user, dispatch, editingUser, savedUser, user.id]);

    if (!savedUser) {
        return <div>No user found.</div>;
    }

    const editing = !!editingUser;
    const allowEdit =
        (isMyAccount && orgUser) ||
        (!isMyAccount && canHaveRole(Role.leader) && canHaveRole(user.role));

    return (
        <div>
            <PageHeader>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '20px',
                    }}
                >
                    <img
                        style={{ width: '80px', height: '80px' }}
                        src={userIcon}
                        alt="User Icon"
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h2>{user.name}</h2>
                        <div
                            style={{
                                padding: '0 20px 10px',
                                fontSize: '16px',
                            }}
                        >
                            {editing && !isMyAccount ? (
                                <DropdownButton
                                    onSelect={(eventKey: any) =>
                                        setEditingUser({
                                            ...user,
                                            role: eventKey,
                                        })
                                    }
                                    title={user.role}
                                    id="role-selector"
                                >
                                    {roles.map((role) => (
                                        <Dropdown.Item
                                            key={role}
                                            eventKey={role}
                                        >
                                            {role}
                                        </Dropdown.Item>
                                    ))}
                                </DropdownButton>
                            ) : (
                                user.role
                            )}
                        </div>
                    </div>
                    <div className="filler"></div>

                    {allowEdit && (
                        <Button
                            disabled={submitting}
                            onClick={handleSaveOrEdit}
                            id="edit-user"
                        >
                            {submitting
                                ? 'saving...'
                                : editing
                                ? 'save'
                                : 'edit'}
                        </Button>
                    )}
                </div>
            </PageHeader>
            {/* <Section header='Teams'>
                    <TeamTags default={defaultTeams} />
                </Section> */}
            <Section header="User details">
                <UserDetailsTable style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Name</th>
                            {canHaveRole(Role.su) && <th>Learner Level</th>}
                            <th>Lesson Progress</th>
                            <th>Status</th>
                            <th>Added on</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <a href={`mailto:${user.email}`}>
                                    {user.email}
                                </a>
                            </td>
                            <td>
                                {editing ? (
                                    <FormControl
                                        style={{ maxWidth: '300px' }}
                                        type="text"
                                        value={user.name}
                                        onChange={(e) =>
                                            setEditingUser({
                                                ...user,
                                                name: (e.currentTarget as any)
                                                    .value,
                                            })
                                        }
                                    />
                                ) : (
                                    user.name
                                )}
                            </td>
                            {canHaveRole(Role.su) && (
                                <td>
                                    {editing ? (
                                        <FormControl
                                            style={{ maxWidth: '80px' }}
                                            type="number"
                                            min={1}
                                            value={user.learnerLevel}
                                            onChange={(e) =>
                                                setEditingUser({
                                                    ...user,
                                                    learnerLevel: (e.currentTarget as any)
                                                        .value,
                                                })
                                            }
                                        />
                                    ) : (
                                        user.learnerLevel
                                    )}
                                </td>
                            )}
                            <td>
                                {user.lessonCounts.completed} completed
                                <br />
                                {user.lessonCounts.inProgress} in progress.
                            </td>
                            <td>
                                {editing && !isMyAccount ? (
                                    <Button
                                        style={{ width: '200px' }}
                                        onClick={() => {
                                            setEditingUser({
                                                ...user,
                                                status:
                                                    user.status ===
                                                    Status.active
                                                        ? Status.deactivated
                                                        : Status.active,
                                            });
                                        }}
                                    >
                                        {user.status}
                                    </Button>
                                ) : (
                                    user.status
                                )}
                            </td>
                            <td>{formatDateTime(user.createdOn)}</td>
                        </tr>
                    </tbody>
                </UserDetailsTable>
                <hr />
            </Section>
        </div>
    );
};

export const User = ensureUsersFetched(
    ensureOrganisationsFetched(UserComponent),
);
