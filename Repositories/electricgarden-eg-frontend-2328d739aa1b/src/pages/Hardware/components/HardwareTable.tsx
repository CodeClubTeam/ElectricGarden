import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AutoSizer, Column, Table } from 'react-virtualized';

import { createAppStructuredSelector } from '../../../selectors';
import { sensorsSelector } from '../selectors';

class HardwareTable extends React.Component<Props, {}> {
    render() {
        return (
            <div style={{ height: '600px' }}>
                <AutoSizer>
                    {({ height, width }) => (
                        <Table
                            width={width}
                            height={height}
                            headerHeight={28}
                            rowHeight={47}
                            rowCount={this.props.sensors.length}
                            rowGetter={({ index }) => this.props.sensors[index]}
                        >
                            {/* <Column width={40} label='&nbsp;' dataKey='' cellRenderer={e => <input type='checkbox' />} /> */}
                            <Column
                                label="Name"
                                dataKey="name"
                                width={200}
                                cellRenderer={(e) => (
                                    <Link to={`/hardware/${e.rowData.serial}`}>
                                        {e.cellData}
                                    </Link>
                                )}
                            />
                            <Column
                                label="Serial"
                                dataKey="serial"
                                width={200}
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
        sensors: sensorsSelector,
        // teams: appState.teams,
    }),
);

export type Props = ExtractProps<typeof connector>;

export default connector(HardwareTable);
