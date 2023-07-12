import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AutoSizer, Column, Table } from 'react-virtualized';

import { createAppStructuredSelector } from '../../../selectors';
import { organisationsByIdSelector } from '../../Organisation';
import { fetchSuSensors } from '../actions';
import { suSensorsBySerialSelector } from '../selectors';

class SuperUserHardware extends React.Component<Props, {}> {
    componentDidMount() {
        if (this.props.suSensors.length === 0) {
            this.props.fetchSuSensors();
        }
    }

    render() {
        let sensors = this.props.suSensors;
        return (
            <div style={{ height: '600px' }}>
                <AutoSizer>
                    {({ height, width }) => (
                        <Table
                            width={width}
                            height={height}
                            headerHeight={28}
                            rowHeight={47}
                            rowCount={sensors.length}
                            rowGetter={({ index }) => sensors[index]}
                        >
                            <Column
                                width={40}
                                label="&nbsp;"
                                dataKey=""
                                cellRenderer={(e) => <input type="checkbox" />}
                            />
                            <Column label="Id" dataKey="_id" width={200} />
                            <Column
                                label="Serial"
                                dataKey="serial"
                                width={200}
                                cellRenderer={(e) => (
                                    <Link to={`/hardware/${e.rowData.serial}/`}>
                                        {e.cellData}
                                    </Link>
                                )}
                            />
                            <Column label="Name" dataKey="name" width={200} />
                            <Column
                                label="Organisation"
                                dataKey="organisationId"
                                width={200}
                                cellRenderer={(e) =>
                                    this.props.organisationsById[e.cellData] &&
                                    this.props.organisationsById[e.cellData]
                                        .name
                                }
                            />
                        </Table>
                    )}
                </AutoSizer>
            </div>
        );
    }
}

const connector = connect(
    createAppStructuredSelector({
        suSensors: suSensorsBySerialSelector,
        organisationsById: organisationsByIdSelector,
    }),
    {
        fetchSuSensors,
    },
);
export type Props = ExtractProps<typeof connector>;

export default connector(SuperUserHardware);
