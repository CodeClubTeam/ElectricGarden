import Papa from 'papaparse';
import { useCallback } from 'react';
import { useMutation } from 'react-query';
import { useDispatch } from 'react-redux';

import { useApi } from '../../../data/ApiProvider';
import { Role, Status } from '../../../utils';
import * as actions from '../actions';
import { LEARNER_LEVEL_DEFAULT } from '../constants';

export type ImportFail = { user: ServerUser; error: string };

const checkExtension = (file: File) => {
    const extension = file.name
        .substr(file.name.lastIndexOf('.'))
        .toLocaleLowerCase();

    switch (extension) {
        case '.xls':
            throw new CsvValidationError([
                `The uploaded file ${file.name} looks like an Excel file. Export as .csv and upload that instead.`,
            ]);
        case '.numbers':
            throw new CsvValidationError([
                `The uploaded file ${file.name} looks like a Numbers file. Export as .csv and upload that instead.`,
            ]);
        case '.csv':
            break;
        default:
            throw new CsvValidationError([
                `The uploaded file ${file.name} doesn't have the expected extension .csv. Check you uploaded the right file.`,
            ]);
    }
};

export const useUsersCsvImporter = () => {
    const api = useApi();
    const dispatch = useDispatch();
    const doImport = useCallback(
        async (file: File) => {
            checkExtension(file);
            const usersToImport = await grabUsers(file);
            const { users, fails } = await api.users.bulkImport(usersToImport);
            for (const user of users) {
                dispatch(actions.updatedOrCreatedUser(user));
            }
            return { fails };
        },
        [api.users, dispatch],
    );
    const { mutate, error, status, data } = useMutation(doImport);
    return { importCsv: mutate, error, status, result: data };
};

const fields = {
    email: ['email', 'email address', 'address', 'e-mail', 'e-mail address'],
    name: [
        'name',
        'first name',
        'username',
        'user name',
        'fullname',
        'full name',
    ],
    role: ['role', 'permissions', 'rank'],
    learnerLevel: [
        'level',
        'learnerLevel',
        'learner level',
        'learner-level',
        'grade',
        'curriculum level',
    ],
};

const getFieldIndexes = (headers: string[]) => {
    const fieldIndexes: Partial<Record<keyof typeof fields, number>> = {};
    Object.entries(fields).forEach(([name, candidates]) => {
        headers.forEach((header, headerIndex) => {
            if (candidates.includes(header.trim().toLowerCase())) {
                fieldIndexes[name as keyof typeof fields] = headerIndex;
            }
        });
    });
    return fieldIndexes;
};

const getValidatedFieldIndexes = (headers: string[]) => {
    const indexes = getFieldIndexes(headers);
    const errors: string[] = [];
    if (!('email' in indexes)) {
        errors.push('Could not find an "email address" column');
    }
    if (!('name' in indexes)) {
        errors.push('Could not find a "name" column');
    }
    if (errors.length > 0) {
        throw new CsvValidationError(errors);
    }
    return indexes as {
        name: number;
        email: number;
    } & Omit<ReturnType<typeof getFieldIndexes>, 'name' | 'email'>;
};

const parse = (file: File) => {
    return new Promise<Papa.ParseResult<any>>((resolve, reject) => {
        Papa.parse(file, {
            complete: resolve,
            error: reject,
        });
    });
};

const trimValues = (values: string[]) => values.map((value) => value ? value.trim() : value);

export const mapRows = (
    headerRow: string[],
    valueRows: string[][],
): ServerUpdateUser[] => {
    const indexes = getValidatedFieldIndexes(headerRow);
    try {
        const returnRows: ServerUpdateUser[] = valueRows.map(trimValues).map((row) => ({
            name: row[indexes.name],
            email: row[indexes.email],
            role:
                indexes.role !== undefined
                    ? (row[indexes.role].toLowerCase() as Role) // let the server do the validation of these + set to lower case role
                    : Role.member,
            learnerLevel:
                indexes.learnerLevel !== undefined
                    ? Number(row[indexes.learnerLevel]) ??
                      row[indexes.learnerLevel] // let the server validate
                    : LEARNER_LEVEL_DEFAULT,
            status: Status.active,
        }));
        return returnRows;
    } catch (error) {
        const errors: string[] = [];
        errors.push(error);
        throw new CsvValidationError(errors);
    }
};

const grabUsers = async (file: File) => {
    const results = await parse(file);
    const headerRow = results.data[0];
    const valueRows = results.data.slice(1);
    while (valueRows[valueRows.length - 1].length === 1) {
        valueRows.pop(); //Removing all empty value rows
    }
    return mapRows(headerRow, valueRows);
};

export class CsvValidationError extends Error {
    constructor(public readonly errors: string[], message?: string) {
        super(message || 'The CSV is not in the correct format.');
        Object.setPrototypeOf(this, CsvValidationError.prototype);
        this.name = 'CsvValidationError';
    }
}