import React, { useCallback, useEffect } from 'react';
import styled from 'styled-components/macro';

import { Loading } from '../../../atomic-ui';
import { DropZone } from '../../../components/common';
import exampleFile from '../../../static/example.csv';
import { CsvError } from './CsvError';
import {
    useUsersCsvImporter,
    ImportFail,
    CsvValidationError,
} from './useUsersCsvImporter';

type Props = {
    onSuccess: (fails: ImportFail[]) => void;
};

const UserDropZone = styled(DropZone)`
    flex: 1;
`;

const Container = styled.div`
    flex: 2;
    text-align: center;
    min-width: 400px;
`;

export const CsvImport = ({ onSuccess }: Props) => {
    const { importCsv, error, status, result } = useUsersCsvImporter();

    const handleFilePicked = useCallback(
        (file: File) => {
            importCsv(file);
        },
        [importCsv],
    );

    const validationErrors = error
        ? error instanceof CsvValidationError
            ? error.errors
            : (error as any).message
        : result
        ? result.fails.map(({ error }) => error)
        : [];

    useEffect(() => {
        if (status === 'success' && result) {
            onSuccess(result.fails);
        }
    }, [onSuccess, result, status]);

    return (
        <Container>
            {validationErrors.length > 0 && (
                <CsvError errors={validationErrors} />
            )}
            <UserDropZone
                onFilePicked={handleFilePicked}
                prompt="Drag &amp; Drop a CSV file with your Users"
                acceptExtensions=".csv"
            >
                {status === 'loading' && <Loading size="4x" />}
            </UserDropZone>
            <a download="example.csv" href={exampleFile}>
                view sample file
            </a>
        </Container>
    );
};
