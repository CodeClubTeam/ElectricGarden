import React from 'react';
import { useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { createSelector } from 'reselect';

import { Button } from '../../../atomic-ui';
import { PageHeader, Section } from '../../../components/common';
import { useCanHaveRole, useModalTrigger } from '../../../hooks';
import { createAppStructuredSelector } from '../../../selectors';
import { Role } from '../../../utils';
import {
    ensureOrganisationsFetched,
    organisationsByIdSelector,
} from '../../Organisation';
import { suSensorsByIdSelector } from '../selectors';
import { ensureSuSensorsFetched } from './ensureFetched';
import { SensorAssign } from './SensorAssign';
import { SensorData } from './SensorData';
import { SensorReplace } from './SensorReplace';

interface Props extends RouteComponentProps<{ hardwareId: string }> {}

const selectedSensorSelectorCreate = (hardwareId: string) =>
    createSelector(
        suSensorsByIdSelector,
        (suSensorsById) => suSensorsById[hardwareId],
    );

export const SensorComponent: React.FC<Props> = ({ match: { params } }) => {
    const {
        show: showAssign,
        handleOpen: handleOpenAssign,
        handleClose: handleCloseAssign,
    } = useModalTrigger();
    const {
        show: showReplace,
        handleOpen: handleOpenReplace,
        handleClose: handleCloseReplace,
    } = useModalTrigger();

    const canHaveRole = useCanHaveRole();

    const { sensor, organisationsById } = useSelector(
        createAppStructuredSelector({
            sensor: selectedSensorSelectorCreate(params.hardwareId),
            organisationsById: organisationsByIdSelector,
        }),
    );

    if (!sensor) {
        return <div>No sensor found.</div>;
    }

    return (
        <div>
            <PageHeader>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h2>{sensor.name}</h2>
                    <div className="filler"></div>
                    {canHaveRole(Role.su) && (
                        <>
                            <SensorAssign
                                sensor={sensor}
                                show={showAssign}
                                onClose={handleCloseAssign}
                            />
                            <Button onClick={handleOpenAssign}>
                                {sensor.organisationId ? 'Re-assign' : 'Assign'}
                            </Button>
                            {!!sensor.organisationId && (
                                <div style={{ marginLeft: '0.5em' }}>
                                    <SensorReplace
                                        sensor={sensor}
                                        show={showReplace}
                                        onClose={handleCloseReplace}
                                    />
                                    <Button danger onClick={handleOpenReplace}>
                                        Replace
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </PageHeader>
            <Section header="Device details">
                <table style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th>Serial</th>
                            <th>Name</th>
                            <th>Organisation</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td title={sensor.id}>{sensor.serial}</td>
                            <td>{sensor.name}</td>
                            <td>
                                {sensor.organisationId &&
                                    organisationsById[sensor.organisationId]
                                        ?.name}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <hr />
            </Section>
            <Section header="Data">
                <SensorData serial={sensor.serial} />
            </Section>
            <Section header="Counters">
                <p>
                    <a
                        href={`${process.env.REACT_APP_DEVICE_HQ_URL}/devices/${sensor.serial}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        See in Device HQ
                    </a>
                </p>
            </Section>
        </div>
    );
};

export const Sensor = ensureOrganisationsFetched(
    ensureSuSensorsFetched(SensorComponent),
);
