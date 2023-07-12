import { LEARNER_LEVEL_DEFAULT } from '../../constants';
import { mapRows } from '../useUsersCsvImporter';

async function grabUsers(results: string[][]) {
    if (!results.length || !results[0].length) {
        throw new Error('No data');
    }
    const headerRow = results[0];
    const valueRows = results.slice(1);
    return mapRows(headerRow, valueRows);
}

describe('valid csv', () => {
    const parsedCsvValid = [
        ['email', 'name', 'Role'],
        ['testuser@example.com', 'test user', 'Member'],
        ['testuser2@example.com', 'test user2', 'Member'],
        ['testuser3@example.com', 'test user3', 'Leader'],
    ];

    const parsedCsvInvalid = [
        ['Student email', 'Student name', 'Role'],
        ['testuser@example.com', 'test user', 'Member'],
        ['testuser3@example.com', 'test user3', 'Leader'],
    ];

    let resultsValid: ServerUpdateUser[];

    beforeEach(async () => {
        resultsValid = await grabUsers(parsedCsvValid);
    });

    it('first user email correct', async () => {
        expect(resultsValid[0]['email']).toBe('testuser@example.com');
    });

    it('second user learner level default', async () => {
        expect(resultsValid[1]['learnerLevel']).toBe(LEARNER_LEVEL_DEFAULT);
    });

    it('third user learner Leader role', async () => {
        expect(resultsValid[2]['role']).toBe('leader');
    });

    it('invalid csv throws error', async () => {
        await expect(grabUsers(parsedCsvInvalid)).rejects.toBeDefined();
    });
});
