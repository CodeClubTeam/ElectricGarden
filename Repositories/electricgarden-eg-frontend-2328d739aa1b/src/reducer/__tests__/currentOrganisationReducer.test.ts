import { currentOrganisationReducer } from '../currentOrganisationReducer';

describe('currentOrganisationReducer', () => {
    let state: ReturnType<typeof currentOrganisationReducer>;

    describe('initial state', () => {
        beforeEach(() => {
            state = currentOrganisationReducer(undefined as any, {
                type: '@@init',
            });
        });
        it('should have no id', () => {
            expect(state.id).toBeNull();
        });

        it('should have no state', () => {
            expect(Object.values(state.state)).toMatchObject({});
        });
    });
});
