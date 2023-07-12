import 'react-virtualized/styles.css';

import React from 'react';
import { MenuItem, SplitButton } from 'react-bootstrap';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';

import {
    PageHeader,
    Section,
    SensorTags,
    UserTags,
} from '../../../components/common';
import { AppState } from '../../../types';
import { sensorOptionsSelector } from '../../Hardware';
import { userOptionsSelector } from '../../Users';
import { teamsByIdSelector } from '../selectors';

interface OwnProps extends RouteComponentProps<{ teamId: string }> {}

class Team extends React.PureComponent<Props, {}> {
    render() {
        if (!this.props.team) {
            return <div>No team found.</div>;
        }
        return (
            <div>
                <PageHeader>
                    <div style={{ display: 'flex' }}>
                        <h2>{this.props.team.name}</h2>
                        <div className="filler"></div>
                        <SplitButton
                            title="edit"
                            id="team-edit"
                            bsStyle="primary"
                        >
                            <MenuItem eventKey="4">Delete</MenuItem>
                        </SplitButton>
                    </div>
                </PageHeader>

                <Section header="Sensors">
                    <SensorTags
                        default={this.props.sensorOptions.filter(
                            (opt) =>
                                !!this.props.team.sensors.find(
                                    (sId) => sId.id === opt.value,
                                ),
                        )}
                    />
                </Section>
                <Section header="Team Leads">
                    <UserTags />
                </Section>
                <Section header="Team details">
                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Created by</th>
                                <th>Created on</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Senior Garden</td>
                                <td>Mrs Smith</td>
                                <td>13:00 20-9-2018</td>
                            </tr>
                        </tbody>
                    </table>
                    <hr />
                </Section>
                <Section header="Users">
                    <UserTags
                        default={this.props.userOptions.filter((opt) =>
                            this.props.team.users.find(
                                (member) => member.id === opt.value,
                            ),
                        )}
                    />
                    {/* <div style={{ display: 'flex' }}>
                        <Search placeholder='Search all users' />
                        <Button bsStyle='primary'>add new user</Button>
                    </div> */}
                </Section>
            </div>
        );
    }
}

const connector = connect((appState: AppState, props: OwnProps) => ({
    userOptions: userOptionsSelector(appState),
    team: teamsByIdSelector(appState)[props.match.params.teamId],
    sensorOptions: sensorOptionsSelector(appState),
}));

type Props = OwnProps & ExtractProps<typeof connector>;

export default connector(Team);
