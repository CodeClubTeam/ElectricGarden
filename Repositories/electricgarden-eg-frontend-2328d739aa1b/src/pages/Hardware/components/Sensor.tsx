import React from 'react';
import { Button, FormControl } from 'react-bootstrap';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import Select from 'react-select';
import { ValueType } from 'react-select/lib/types';
import { createSelector, createStructuredSelector } from 'reselect';

import { PageHeader, Section } from '../../../components/common';
import getServer from '../../../data/server';
import { AppState } from '../../../types';
import { rollCheck } from '../../../selectors';
import { getSingle, Role, thingToOption } from '../../../utils';
import {
    organisationOptionsSelector,
    organisationsByIdSelector,
} from '../../Organisation';
import { fetchSensorsSucceeded, fetchSuSensorsSucceeded } from '../actions';
import { sensorsByIdSelector, suSensorsByIdSelector } from '../selectors';

interface OwnProps extends RouteComponentProps<{ hardwareId: string }> {}

class Sensor extends React.Component<Props, State> {
    state: State = {};

    private async save(sensor: ServerSensor) {
        const { name, serial, organisationId } = sensor;
        this.setState({ saving: true });
        const serverUpdateSensor = {
            name,
            serial,
            organisation: organisationId, // legacy until server updates api to organisationId?
            organisationId,
        };
        try {
            const server = getServer();
            const response = await server.sensor.update(
                serial,
                serverUpdateSensor,
            );
            if (!response.success) {
                if (response.error === 'Could not find sensor') {
                    const responses = await server.sensor.create([
                        serverUpdateSensor,
                    ]);

                    const response = responses[0];
                    if (!response.success) {
                        throw new Error(JSON.stringify(response.error));
                    }

                    const newSensorRecord: ServerSuperUserSensor = {
                        _id: response.value.id,
                        friendlyName: response.value.name,
                        organisationId: serverUpdateSensor.organisationId,
                        serial: serverUpdateSensor.serial,
                    };

                    this.props.fetchSuSensorsSucceeded([newSensorRecord]);
                    this.setState({
                        editingSensor: undefined,
                    });

                    return;
                } else {
                    throw new Error(JSON.stringify(response.error));
                }
            }

            const newSensorRecord: ServerSensor = {
                id: response.value.id,
                name: response.value.name,
                organisationId: serverUpdateSensor.organisationId,
                serial: serverUpdateSensor.serial,
            };

            const newSUSensorRecord: ServerSuperUserSensor = {
                _id: response.value.id,
                friendlyName: response.value.name,
                organisationId: serverUpdateSensor.organisationId,
                serial: serverUpdateSensor.serial,
            };

            this.props.fetchSensorsSucceeded([newSensorRecord]);
            this.props.fetchSuSensorsSucceeded([newSUSensorRecord]);
            this.setState({ editingSensor: undefined });
        } finally {
            this.setState({ saving: false });
        }
    }

    private handleSaveOrEdit = () => {
        if (this.state.editingSensor) {
            this.save(this.state.editingSensor).catch((err) => {
                console.error(err);
            });
        } else {
            this.setState({ editingSensor: this.props.sensor });
        }
    };

    private onOrgChange = (e: ValueType<Tag>) => {
        let orgOption = getSingle(e);
        console.log(orgOption);
        if (!orgOption || !this.state.editingSensor) {
            return;
        }
        this.setState({
            editingSensor: {
                ...this.state.editingSensor,
                organisationId: orgOption.value,
            },
        });
    };

    render() {
        const { organisationOptions } = this.props;
        if (!this.props.sensor) {
            return <div>No sensor found.</div>;
        }

        let sensor = this.state.editingSensor || this.props.sensor;
        let allowEditing = this.props.rollCheck(Role.su);
        let editing = !!this.state.editingSensor;

        let org = this.props.organisationsById[sensor.organisationId!];

        return (
            <div>
                <PageHeader>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h2>{sensor.name}</h2>
                        <div className="filler"></div>
                        {/* <Button bsStyle="info">view live data</Button> */}
                        {allowEditing && (
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
                <TeamTags default={this.props.teamOptions.filter(opt => sensor.teams.find(team => team.id === opt.value))} />
            </Section> */}
                <Section header="Sensor details">
                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                {this.props.rollCheck(Role.su) && <th>Id</th>}
                                <th>Serial</th>
                                <th>Name</th>
                                {this.props.rollCheck(Role.su) && (
                                    <th>Organisation</th>
                                )}
                                {/* <th>Added on</th> */}
                                {/* <th>Plant Type</th> */}
                                {/* <th>Status</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {this.props.rollCheck(Role.su) && (
                                    <td>{this.props.sensor.id}</td>
                                )}
                                <td>{sensor.serial}</td>
                                <td>
                                    {editing ? (
                                        <FormControl
                                            style={{ maxWidth: '300px' }}
                                            type="text"
                                            value={sensor.name || ''}
                                            onChange={(e) =>
                                                this.setState({
                                                    editingSensor: {
                                                        ...sensor,
                                                        name: (e.currentTarget as any)
                                                            .value,
                                                    },
                                                })
                                            }
                                        />
                                    ) : (
                                        sensor.name
                                    )}
                                </td>
                                {this.props.rollCheck(Role.su) && (
                                    <td>
                                        {editing ? (
                                            <Select
                                                options={organisationOptions}
                                                value={
                                                    org && thingToOption(org)
                                                }
                                                onChange={this.onOrgChange}
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        backgroundColor:
                                                            'white',
                                                        minWidth: '200px',
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
                                                        margin: '1px 0',
                                                    }),
                                                }}
                                                components={{
                                                    IndicatorSeparator: () =>
                                                        null,
                                                }}
                                            />
                                        ) : (
                                            org && org.name
                                        )}
                                    </td>
                                )}
                                {/* <td>{moment(sensor.dateInstalled).format('YYYY-MM-DD hh:mm a')}</td> */}
                                {/* <td>{PlantType[sensor.plantType]}</td> */}
                                {/* <td>{SensorStatus[sensor.status]}</td> */}
                            </tr>
                        </tbody>
                    </table>
                    <hr />
                </Section>
                {/* <Section header='Plant Type'>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>Select Plant Type from list</span>
                    <div style={{ width: '300px', paddingLeft: '50px' }}>
                        <Select
                            options={plantOptions}
                            value={plantOptions[0]}
                            onChange={console.log}
                            styles={{
                                control: (base) => ({ ...base, backgroundColor: 'white' }),
                                menu: (base) => ({ ...base, margin: '1px 0' }),
                            }}
                            components={{
                                IndicatorSeparator: () => null,
                            }}
                        />
                    </div>
                </div>
            </Section>
            <Section header='Profile photo'>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '100px', height: '100px', backgroundColor: 'yellow' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', margin: '20px', flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                            Upload our photo
                    </div>
                        <div>
                            You can upload your own photo or use one from The Electric Garden <a>library</a>
                        </div>
                    </div>
                    <Button bsStyle='success'>Upload your photo</Button>
                </div>


            </Section> */}
            </div>
        );
    }
}

// const plantTypes = {
//     'sunflower': {
//         id: 'sunflower',
//         name: 'Sunflower',
//     },
//     'pumpkin': {
//         id: 'pumpkin',
//         name: 'Pumpkin',
//     }
// }

// const plantOptions = _.values(plantTypes).map(thingToOption);

interface State {
    editingSensor?: ServerSensor;
    saving?: boolean;
}

const routeHardwareIdSelector = (
    _: AppState,
    { match: { params } }: OwnProps,
) => params.hardwareId;

const selectedSensorSelector = createSelector(
    routeHardwareIdSelector,
    sensorsByIdSelector,
    suSensorsByIdSelector,
    (hardwareId, sensorsById, suSensorsById) =>
        sensorsById[hardwareId] || suSensorsById[hardwareId],
);

const connector = connect(
    // TODO: beef up createAppStructuredSelector to support own props
    createStructuredSelector<
        AppState,
        OwnProps,
        {
            sensor: ReturnType<typeof selectedSensorSelector>;
            rollCheck: ReturnType<typeof rollCheck>;
            organisationsById: ReturnType<typeof organisationsByIdSelector>;
            organisationOptions: ReturnType<typeof organisationOptionsSelector>;
        }
    >({
        sensor: selectedSensorSelector,
        // teamOptions: teamOptions(appState),
        rollCheck,
        organisationsById: organisationsByIdSelector,
        organisationOptions: organisationOptionsSelector,
    }),
    {
        fetchSensorsSucceeded,
        fetchSuSensorsSucceeded,
    },
);

type Props = OwnProps & ExtractProps<typeof connector>;

export default connector(Sensor);
