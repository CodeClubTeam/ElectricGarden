import React from 'react';
import { useSelector } from 'react-redux';
import { AutoSizer, Column, Table } from 'react-virtualized';

import { sensorsSummarySelector } from '../selectors';
import { ensureSensorsFetched } from './ensureFetched';
import { useRouteMatch, Link } from 'react-router-dom';

const HardwareTableComponent: React.FC = () => {
    const { url } = useRouteMatch();
    const sensors = useSelector(sensorsSummarySelector);

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
                        <Column label="Name" dataKey="name" width={200} />
                        <Column
                            label="Serial"
                            dataKey="serial"
                            width={200}
                            cellRenderer={(e) => (
                                <Link to={`${url}/${e.cellData}`}>
                                    {e.cellData}
                                </Link>
                            )}
                        />
                    </Table>
                )}
            </AutoSizer>
        </div>
    );
};

export const HardwareTable = ensureSensorsFetched(HardwareTableComponent);
