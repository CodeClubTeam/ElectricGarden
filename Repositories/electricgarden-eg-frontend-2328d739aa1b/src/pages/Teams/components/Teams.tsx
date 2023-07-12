import '../../../components/common/tags.scss';
import 'react-virtualized/styles.css';

import moment from 'moment';
import React from 'react';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AutoSizer, Column, Table } from 'react-virtualized';

import { PageHeader, Search, Section } from '../../../components/common';
import { createAppStructuredSelector } from '../../../selectors';
import trashIcon from '../../../static/trash.svg';
import { teamsSelector } from '../selectors';

class Teams extends React.PureComponent<Props, {}> {
    render() {
        return (
            <div>
                <PageHeader>
                    <h2>Teams</h2>
                    <div style={{ display: 'flex' }}>
                        <Search placeholder="Search all teams" />
                        <Button bsStyle="primary">add new team</Button>
                    </div>
                </PageHeader>

                <Section header="Teams">
                    <div style={{ height: '400px' }}>
                        <AutoSizer>
                            {({ height, width }) => (
                                <Table
                                    width={width}
                                    height={height}
                                    headerHeight={28}
                                    rowHeight={47}
                                    rowCount={this.props.teams.length}
                                    sortBy="name"
                                    rowGetter={({ index }) =>
                                        this.props.teams[index]
                                    }
                                >
                                    <Column
                                        width={40}
                                        label="&nbsp;"
                                        dataKey=""
                                        cellRenderer={(e) => (
                                            <input type="checkbox" />
                                        )}
                                    />
                                    <Column
                                        label="Name"
                                        dataKey="name"
                                        width={500}
                                        cellRenderer={(e) => (
                                            <Link
                                                to={`/teams/${e.rowData.id}/`}
                                            >
                                                {e.cellData}
                                            </Link>
                                        )}
                                    />
                                    <Column
                                        width={300}
                                        label="Users"
                                        dataKey="users"
                                        cellRenderer={(e) => (
                                            <div>
                                                {
                                                    (e.rowData as Team).users
                                                        .length
                                                }
                                            </div>
                                        )}
                                    />
                                    <Column
                                        width={300}
                                        label="Date Created"
                                        dataKey="dateCreated"
                                        cellRenderer={(e) => (
                                            <span>
                                                {moment(e.cellData).format(
                                                    'YYYY-MM-DD hh:mm a',
                                                )}
                                            </span>
                                        )}
                                    />
                                    <Column
                                        width={40}
                                        label="&nbsp;"
                                        dataKey=""
                                        cellRenderer={(e) => (
                                            <img src={trashIcon} alt="Delete" />
                                        )}
                                    />
                                </Table>
                            )}
                        </AutoSizer>
                    </div>
                </Section>
            </div>
        );
    }
}

const connector = connect(
    createAppStructuredSelector({
        teams: teamsSelector,
    }),
);

type Props = ExtractProps<typeof connector>;

export default connector(Teams);
