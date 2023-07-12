import moment from 'moment';
import React from 'react';
import { Button, DropdownButton, FormControl, MenuItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';

import { fetchUsersSucceeded } from '../actions';
import { PageHeader, Section } from '../../../components/common';
import getServer from '../../../data/server';
import { AppState } from '../../../types';
import { rollCheck } from '../../../selectors';
import userIcon from '../../../static/user.svg';
import { Role, Status } from '../../../utils';
import { teamsSelector } from '../../Teams';
import { usersByIdSelector } from '../selectors';

interface OwnProps extends RouteComponentProps<{ userId: string }> {}

class User extends React.Component<Props, State> {
    state: State = {};

    private async save(user: ServerUser) {
        this.setState({ saving: true });
        try {
            const response = await getServer().user.update(user.id, user);
            if (!response.success) {
                throw new Error(JSON.stringify(response.error));
            }
            this.props.fetchUsersSucceeded([response.value]);
        } finally {
            this.setState({ saving: false });
        }
    }

    private handleSaveOrEdit = () => {
        if (this.state.editingUser) {
            this.save(this.state.editingUser)
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    this.setState({ editingUser: undefined });
                });
        } else {
            this.setState({ editingUser: this.props.user });
        }
    };

    render() {
        if (!this.props.user) {
            return <div>No user found.</div>;
        }
        let user = this.state.editingUser || this.props.user;
        let editing = !!this.state.editingUser;

        let isMyAccount = this.props.isMyAccount;
        let allowEdit =
            isMyAccount ||
            (this.props.rollCheck(Role.leader) &&
                this.props.rollCheck(user.role));

        // let defaultTeams = user.teams.map(thingToOption);
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
                        <div
                            style={{ display: 'flex', flexDirection: 'column' }}
                        >
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
                                            this.setState({
                                                editingUser: {
                                                    ...user,
                                                    role: eventKey,
                                                },
                                            })
                                        }
                                        title={user.role}
                                        id="role-selector"
                                    >
                                        <MenuItem eventKey="member">
                                            member
                                        </MenuItem>
                                        <MenuItem eventKey="leader">
                                            leader
                                        </MenuItem>
                                        {this.props.rollCheck(Role.admin) && (
                                            <MenuItem eventKey="admin">
                                                admin
                                            </MenuItem>
                                        )}
                                        {this.props.rollCheck(Role.su) && (
                                            <MenuItem eventKey="su">
                                                su
                                            </MenuItem>
                                        )}
                                    </DropdownButton>
                                ) : (
                                    user.role
                                )}
                            </div>
                        </div>
                        <div className="filler"></div>

                        {allowEdit && (
                            <Button
                                disabled={this.state.saving}
                                onClick={this.handleSaveOrEdit}
                                id="edit-user"
                                bsStyle="primary"
                            >
                                {this.state.saving
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
                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Name</th>
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
                                                this.setState({
                                                    editingUser: {
                                                        ...user,
                                                        name: (e.currentTarget as any)
                                                            .value,
                                                    },
                                                })
                                            }
                                        />
                                    ) : (
                                        user.name
                                    )}
                                </td>
                                <td>
                                    {editing && !isMyAccount ? (
                                        <Button
                                            style={{ width: '200px' }}
                                            onClick={() => {
                                                this.setState({
                                                    editingUser: {
                                                        ...user,
                                                        status:
                                                            user.status ===
                                                            Status.active
                                                                ? Status.deactivated
                                                                : Status.active,
                                                    },
                                                });
                                            }}
                                        >
                                            {user.status}
                                        </Button>
                                    ) : (
                                        user.status
                                    )}
                                </td>
                                <td>
                                    {moment(user.date).format(
                                        'HH:mm DD-M-YYYY',
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <hr />
                </Section>
            </div>
        );
    }
}

interface State {
    editingUser?: ServerUser;
    saving?: boolean;
}

const connector = connect(
    (appState: AppState, props: OwnProps) => ({
        user: usersByIdSelector(appState)[props.match.params.userId],
        isMyAccount:
            appState.currentUser &&
            props.match.params.userId === appState.currentUser.id,
        teams: teamsSelector,
        rollCheck: rollCheck(appState),
    }),
    {
        fetchUsersSucceeded,
    },
);

type Props = OwnProps & ExtractProps<typeof connector>;

export default connector(User);
