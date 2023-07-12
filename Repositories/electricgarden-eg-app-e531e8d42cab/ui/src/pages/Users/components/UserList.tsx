import { orderBy } from 'lodash-es';
import React, { useCallback, useState } from 'react';
import MediaQuery from 'react-responsive';
import { useRouteMatch } from 'react-router';
import { Link } from 'react-router-dom';
import { AutoSizer, Column, SortDirectionType, Table } from 'react-virtualized';
import styled from 'styled-components/macro';

import { useCanHaveRole } from '../../../hooks';
import { Role } from '../../../utils';
import { ensureUsersFetched } from './ensureUsersFetched';
import { UserSelect } from './UserSelect';

const Container = styled.div`
    height: 600px;
`;

type SortKey = keyof ServerUser;

const DEFAULT_SORT_KEY: SortKey = 'name';
const DEFAULT_SORT_DIR: SortDirectionType = 'DESC';

type Props = {
    users: ServerUser[];
    showDeactivated?: boolean;
    selectedIds: string[];
    onIdSelected: (id: string) => void;
    onIdDeselected: (id: string) => void;
};

const UserListComponent = ({
    users,
    selectedIds,
    onIdSelected,
    onIdDeselected,
    showDeactivated = false,
}: Props) => {
    const { path } = useRouteMatch();
    const [sortDirection, setSortDirection] =
        useState<SortDirectionType>(DEFAULT_SORT_DIR);
    const [sortByName, setSortByName] = useState<SortKey>(DEFAULT_SORT_KEY);
    const canHaveRole = useCanHaveRole();

    const handleSort = useCallback(
        ({
            sortBy,
            sortDirection,
        }: {
            sortBy: string;
            sortDirection: SortDirectionType;
        }) => {
            setSortDirection(sortDirection);
            setSortByName(sortBy as SortKey);
        },
        [],
    );

    const filteredUsers = users.filter(
        (u) => showDeactivated || u.status !== 'deactivated',
    );

    const flattenedUsers = filteredUsers.map(({ lessonCounts, ...rest }) => ({
        ...rest,
        completedLessons: lessonCounts.completed,
        inProgressLessons: lessonCounts.inProgress,
    }));

    const sortedUsers = orderBy(
        flattenedUsers,
        sortByName,
        sortDirection === 'ASC' ? 'asc' : 'desc',
    );

    return (
        <Container>
            <MediaQuery minDeviceWidth={800}>
                {(desktop) => (
                    <AutoSizer>
                        {({ height, width }) => (
                            <Table
                                width={width}
                                height={height}
                                headerHeight={28}
                                rowHeight={47}
                                rowCount={sortedUsers.length}
                                sort={handleSort}
                                sortBy={sortByName}
                                sortDirection={sortDirection}
                                rowGetter={({ index }) => sortedUsers[index]}
                            >
                                <Column
                                    width={40}
                                    dataKey=""
                                    cellRenderer={({ rowData }) => (
                                        <UserSelect
                                            selected={selectedIds.includes(
                                                rowData.id,
                                            )}
                                            onSelectedChanged={(selected) => {
                                                if (selected) {
                                                    onIdSelected(rowData.id);
                                                } else {
                                                    onIdDeselected(rowData.id);
                                                }
                                            }}
                                        />
                                    )}
                                />
                                <Column
                                    label="Name"
                                    dataKey="name"
                                    width={350}
                                    cellRenderer={(e) => (
                                        <Link to={`${path}${e.rowData.id}`}>
                                            {e.cellData}
                                        </Link>
                                    )}
                                />
                                <Column
                                    width={300}
                                    label="Email"
                                    dataKey="email"
                                    cellRenderer={(e) => (
                                        <a href={`mailto:${e.cellData}`}>
                                            {e.cellData}
                                        </a>
                                    )}
                                />
                                {desktop && (
                                    <Column
                                        width={150}
                                        label="Role"
                                        dataKey="role"
                                        cellRenderer={(e) => e.cellData}
                                    />
                                )}

                                {desktop && canHaveRole(Role.su) && (
                                    <Column
                                        width={150}
                                        label="Level"
                                        dataKey="learnerLevel"
                                        cellRenderer={(e) => e.cellData}
                                    />
                                )}

                                {desktop && (
                                    <Column
                                        width={150}
                                        label="Status"
                                        dataKey="status"
                                        cellDataGetter={(e) =>
                                            e.rowData[e.dataKey]
                                        }
                                    />
                                )}
                                {desktop && (
                                    <Column
                                        width={150}
                                        label="Completed"
                                        dataKey="completedLessons"
                                        cellRenderer={(e) => e.cellData}
                                    />
                                )}
                                {desktop && (
                                    <Column
                                        width={170}
                                        label="In Progress"
                                        dataKey="inProgressLessons"
                                        cellRenderer={(e) => e.cellData}
                                    />
                                )}
                            </Table>
                        )}
                    </AutoSizer>
                )}
            </MediaQuery>
        </Container>
    );
};

export const UserList = ensureUsersFetched(UserListComponent);
