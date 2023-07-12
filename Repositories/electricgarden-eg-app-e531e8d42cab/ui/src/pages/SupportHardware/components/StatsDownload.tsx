import fileSaver from 'file-saver';
import moment from 'moment';
import Papa from 'papaparse';
import React from 'react';

import { Button } from '../../../atomic-ui';
import { useApi } from '../../../data/ApiProvider';

export const StatsDownload = () => {
    const api = useApi();

    const handleDownload = () => {
        const formatDate = (date: Date | null) =>
            date ? moment(date).format('yyyy-MM-DD HH:mm:ss') : '';

        const doDownload = async () => {
            const data = await api.organisation.stats();
            const csvData = data.map(
                ({
                    deviceFirstSample,
                    deviceLastSample,
                    lastLogin,
                    firstLogin,
                    ...fields
                }) => ({
                    ...fields,
                    deviceFirstSample: formatDate(deviceFirstSample),
                    deviceLastSample: formatDate(deviceLastSample),
                    lastLogin: formatDate(lastLogin),
                    firstLogin: formatDate(firstLogin),
                }),
            );

            const csv = Papa.unparse(csvData);
            const blob = new Blob([csv], { type: 'text/plain;charset=utf-8' });
            fileSaver.saveAs(blob, `usage-stats-snapshot.csv`);
        };

        doDownload();
    };

    return (
        <p>
            <Button size="1x" onClick={handleDownload}>
                Download All Orgs Stats Snapshot
            </Button>
        </p>
    );
};
