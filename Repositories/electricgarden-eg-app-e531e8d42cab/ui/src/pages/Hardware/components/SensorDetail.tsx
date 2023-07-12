import { useParams } from 'react-router-dom';

import { PageHeader, Section } from '../../../components/common';
import { useSelector } from 'react-redux';
import { sensorSummarySelectorCreate } from '../selectors';
import { ensureSensorsFetched } from './ensureFetched';
import { SensorMobileDetail } from './SensorMobileDetail';
import { SensorRename } from '../../SupportHardware/components/SensorRename';
import { useModalTrigger } from '../../../hooks';
import { theme } from '../../../theme';
import styled from 'styled-components/macro';
import { ButtonProps } from '../../../atomic-ui';

const RenameButton = styled(
    ({ secondary, danger, ...btnProps }: ButtonProps) => (
        <button {...btnProps} />
    ),
)`
    border: none;
    font-size: 12px;
    line-height: 15px;
    padding: 0.3em 0.5em;
    text-transform: lowercase;

    background: ${theme.btn.primary.bg};
    border-radius: 20px;
    color: ${theme.btn.primary.fg};
    margin-left: 5px;
    :hover {
        opacity: 0.5;
    }
`;

export const SensorDetail = ensureSensorsFetched(() => {
    const { serial } = useParams<{ serial: string }>();
    const sensor = useSelector(sensorSummarySelectorCreate(serial));
    const {
        show: showAssign,
        handleOpen: handleOpenAssign,
        handleClose: handleCloseAssign,
    } = useModalTrigger();

    return (
        <div>
            <PageHeader>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                    }}
                >
                    <h2>Devices</h2>
                </div>
            </PageHeader>
            <Section header="Device details">
                {!sensor && <p>Sensor not found with serial: {serial}</p>}
                {sensor && (
                    <>
                        <p style={{ fontSize: '20px' }}>
                            <b style={{ fontWeight: 1000, fontSize: '16px' }}>
                                Serial:{' '}
                            </b>
                            {sensor.serial}
                        </p>
                        <p style={{ fontSize: '20px' }}>
                            <b style={{ fontWeight: 1000, fontSize: '16px' }}>
                                Name:{' '}
                            </b>
                            {sensor.name}
                            <SensorRename
                                sensor={sensor}
                                show={showAssign}
                                onClose={handleCloseAssign}
                            />
                            <RenameButton onClick={handleOpenAssign}>
                                rename
                            </RenameButton>
                        </p>
                        <SensorMobileDetail serial={sensor.serial} />
                    </>
                )}
            </Section>
        </div>
    );
});
