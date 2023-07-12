import { orderBy } from 'lodash-es';
import moment from 'moment';
import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { AutoSizer, Column, SortDirectionType, Table } from 'react-virtualized';
import { createAppStructuredSelector } from '../../../selectors';
import { formatDateTime } from '../../../utils';
import {
    ensureOrganisationsFetched,
    organisationsByIdSelector,
    useOrganisationSwitch,
} from '../../Organisation';
import { suSensorsWithStatsSelector } from '../selectors';
import { ensureSuSensorsFetched } from './ensureFetched';

type Props = RouteComponentProps & {
    filterSerial?: string;
    hideSilent?: boolean;
    filterStartDate?: moment.Moment;
};

type SortKey = keyof ReturnType<typeof suSensorsWithStatsSelector>[0];

const DEFAULT_SORT_KEY: SortKey = 'readingAveragePerDay';
const DEFAULT_SORT_DIR: SortDirectionType = 'DESC';

const Component: React.FC<Props> = ({
    match: { path },
    filterSerial,
    hideSilent,
    filterStartDate,
}) => {
    const [sortDirection, setSortDirection] = useState<SortDirectionType>(
        DEFAULT_SORT_DIR,
    );
    const [sortByName, setSortByName] = useState<SortKey>(DEFAULT_SORT_KEY);
    const orgSwitcher = useOrganisationSwitch();

    const { sensors, organisationsById } = useSelector(
        createAppStructuredSelector({
            sensors: suSensorsWithStatsSelector,
            organisationsById: organisationsByIdSelector,
        }),
    );

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

    const filteredSensors =
        filterSerial || hideSilent
            ? sensors.filter(
                  (s) =>
                      (!filterSerial || s.serial === filterSerial) &&
                      (!hideSilent || !!s.lastReading) &&
                      (!filterStartDate ||
                          !s.firstReading ||
                          s.firstReading.isAfter(filterStartDate)),
              )
            : sensors;

    const sortedSensors = orderBy(
        filteredSensors,
        sortByName,
        sortDirection === 'ASC' ? 'asc' : 'desc',
    );

    const handleOrgSwitch = useCallback(
        (orgId: string) => {
            orgSwitcher.setOrganisationId(orgId);
        },
        [orgSwitcher],
    );

    return (
        <div style={{ height: '600px' }}>
            <AutoSizer>
                {({ height, width }) => (
                    <Table
                        width={width}
                        height={height}
                        headerHeight={28}
                        rowHeight={47}
                        rowCount={sortedSensors.length}
                        rowGetter={({ index }) => sortedSensors[index]}
                        sort={handleSort}
                        sortBy={sortByName}
                        sortDirection={sortDirection}
                    >
                        <Column
                            label="Serial"
                            dataKey="serial"
                            width={200}
                            cellRenderer={(e) => (
                                <Link to={`${path}/${e.cellData}/`}>
                                    {e.cellData}
                                </Link>
                            )}
                        />
                        <Column
                            label="Friendly Name"
                            dataKey="name"
                            width={200}
                        />
                        <Column
                            label="Organisation"
                            dataKey="organisationId"
                            width={200}
                            cellRenderer={(e) => (
                                <Link
                                    to={`/data`}
                                    onClick={() => handleOrgSwitch(e.cellData)}
                                >
                                    {organisationsById[e.cellData] &&
                                        organisationsById[e.cellData].name}
                                </Link>
                            )}
                        />
                        <Column
                            label="First Reading"
                            dataKey="firstReading"
                            width={150}
                            cellRenderer={(e) => (
                                <span
                                    title={
                                        e.cellData && formatDateTime(e.cellData)
                                    }
                                >
                                    {e.cellData
                                        ? moment(e.cellData).fromNow()
                                        : 'never'}
                                </span>
                            )}
                        />
                        <Column
                            label="Last Reading"
                            dataKey="lastReading"
                            width={150}
                            cellRenderer={(e) => (
                                <span
                                    title={
                                        e.cellData && formatDateTime(e.cellData)
                                    }
                                >
                                    {e.cellData
                                        ? moment(e.cellData).fromNow()
                                        : 'never'}
                                </span>
                            )}
                        />
                        <Column
                            label="Readings"
                            dataKey="readingsCount"
                            width={100}
                            style={{ textAlign: 'right' }}
                            cellRenderer={(e) => <span>{e.cellData}</span>}
                        />
                        <Column
                            label="Avg Daily"
                            dataKey="readingAveragePerDay"
                            width={100}
                            style={{ textAlign: 'right' }}
                            cellRenderer={(e) => <span>{e.cellData}</span>}
                        />
                    </Table>
                )}
            </AutoSizer>
        </div>
    );
};

export const HardwareTable = ensureOrganisationsFetched(
    ensureSuSensorsFetched(withRouter(Component)),
);
