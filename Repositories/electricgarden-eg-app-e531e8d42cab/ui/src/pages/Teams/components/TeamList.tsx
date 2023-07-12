import 'react-virtualized/styles.css';

import React from 'react';
import { useSelector } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { AutoSizer, Column, Table } from 'react-virtualized';

import { teamsSummarySelector } from '../selectors';

const Component: React.FC<RouteComponentProps> = ({ match: { url } }) => {
    const teams = useSelector(teamsSummarySelector);
    return (
        <div style={{ height: '400px' }}>
            <AutoSizer>
                {({ height, width }) => (
                    <Table
                        width={width}
                        height={height}
                        headerHeight={28}
                        rowHeight={47}
                        rowCount={teams.length}
                        sortBy="name"
                        rowGetter={({ index }) => teams[index]}
                    >
                        <Column
                            label="Name"
                            dataKey="name"
                            width={500}
                            cellRenderer={(e) => (
                                <Link to={`${url}/${e.rowData.id}/`}>
                                    {e.cellData}
                                </Link>
                            )}
                        />
                        <Column
                            width={500}
                            label="Leaders"
                            dataKey="leaders"
                            cellRenderer={(e) => <p>{e.cellData.join(', ')}</p>}
                        />
                        <Column
                            width={100}
                            label="Members"
                            dataKey="memberCount"
                            cellRenderer={(e) => <p>{e.cellData}</p>}
                        />
                    </Table>
                )}
            </AutoSizer>
        </div>
    );
};

export const TeamList = withRouter(Component);
