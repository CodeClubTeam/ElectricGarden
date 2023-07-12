import moment from 'moment';
import React, { useState } from 'react';
import styled from 'styled-components/macro';

import supportIcon from '../../../static/fahardware.svg';
import { PageHeader, Section } from '../../../components/common';
import { HardwareTable } from './HardwareTable';
import { SerialSelector } from './SerialSelector';
import { StatsDownload } from './StatsDownload';

const FilterContainer = styled.div`
    margin-left: auto;
    display: flex;

    > * {
        margin-left: 2em;
    }
    > label {
        white-space: nowrap;
    }
`;

const DEFAULT_FILTER_START_DATE = moment('2020-01-20');

export const Hardware: React.FC = () => {
    const [hideSilent, setHideSilent] = useState(true);
    const [filterSerial, setFilterSerial] = useState<string | undefined>(
        undefined,
    );
    const [filterStartDate, setFilterStartDate] = useState<
        moment.Moment | undefined
    >(DEFAULT_FILTER_START_DATE);
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
                    <img
                        style={{ margin: '-5px -5px 0 0' }}
                        src={supportIcon}
                        alt={'Hardware Support'}
                    />
                    <h2>Hardware</h2>
                    <StatsDownload />
                    <FilterContainer>
                        <SerialSelector
                            value={filterSerial}
                            onChange={(serial) => setFilterSerial(serial)}
                            placeholder="Quickfind by serial"
                            escapeClearsValue
                        />

                        <label>
                            <input
                                type="checkbox"
                                onChange={() => setHideSilent(!hideSilent)}
                                checked={hideSilent}
                            />{' '}
                            hide silent
                        </label>

                        <label>
                            First Reading From{' '}
                            <input
                                type="date"
                                value={
                                    filterStartDate
                                        ? filterStartDate.format('YYYY-MM-DD')
                                        : undefined
                                }
                                onChange={(e) =>
                                    setFilterStartDate(
                                        e.target?.value
                                            ? moment(e.target.value)
                                            : undefined,
                                    )
                                }
                            />
                        </label>
                    </FilterContainer>
                </div>
            </PageHeader>
            <Section header="Device details">
                <HardwareTable
                    filterSerial={filterSerial}
                    hideSilent={hideSilent}
                    filterStartDate={filterStartDate}
                />
            </Section>
        </div>
    );
};
