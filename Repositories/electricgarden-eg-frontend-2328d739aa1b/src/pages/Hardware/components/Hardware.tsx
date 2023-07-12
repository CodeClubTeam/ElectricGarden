import React from 'react';
import { Checkbox } from 'react-bootstrap';
import { connect } from 'react-redux';

import { PageHeader, Section } from '../../../components/common';
import { createAppStructuredSelector, rollCheck } from '../../../selectors';
import { Role } from '../../../utils';
import HardwareTable from './HardwareTable';
import SuperUserHardware from './SuperUserHardware';

class Hardware extends React.Component<Props, {}> {
    state: State = {
        viewAll: false,
    };

    private onCheckboxChange = (e: React.FormEvent<Checkbox>) => {
        this.setState({ viewAll: !this.state.viewAll });
    };

    render() {
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
                        <h2>Hardware</h2>
                        {this.props.rollCheck(Role.su) && (
                            <Checkbox
                                onChange={this.onCheckboxChange}
                                checked={!!this.state.viewAll}
                            >
                                view all
                            </Checkbox>
                        )}
                    </div>
                </PageHeader>
                <Section header="Sensor details">
                    {this.state.viewAll ? (
                        <SuperUserHardware />
                    ) : (
                        <HardwareTable />
                    )}
                </Section>
            </div>
        );
    }
}

interface State {
    viewAll?: boolean;
}

const connector = connect(
    createAppStructuredSelector({
        rollCheck,
    }),
);
export type Props = ExtractProps<typeof connector>;

export default connector(Hardware);
