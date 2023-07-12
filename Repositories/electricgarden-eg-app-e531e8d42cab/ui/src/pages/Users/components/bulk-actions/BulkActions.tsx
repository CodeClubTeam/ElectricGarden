import React, { useCallback, useReducer } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components/macro';

import * as actions from '../../actions';
import { useUserSelections } from '../UserSelections';
import { ActivateBulkAction } from './ActivateBulkAction';
import { CompletedSummary } from './CompletedSummary';
import { DeactivateBulkAction } from './DeactivateBulkAction';
import { BulkActionProps } from './shared';
import { bulkActionsReducer, initialState } from './bulkActionState';
import { ClearLessonsProgressBulkAction } from './ClearLessonsProgressBulkAction';

const Container = styled.div`
    display: flex;
`;

const List = styled.ul`
    display: flex;
    list-style-image: none;
    padding: 0;
    flex-flow: wrap;
`;

const ListItem = styled.li`
    display: inline-block;
    margin: 4px;
`;

export const BulkActions = () => {
    const [state, dispatch] = useReducer(bulkActionsReducer, initialState);

    const { selectedUsers, onResetSelections } = useUserSelections();
    const reduxDispatch = useDispatch();

    const handleSucceeded = useCallback(
        (user: ServerUser) => {
            dispatch({ type: 'UPDATE_SUCCEEDED', payload: { user } });
            reduxDispatch(actions.updatedOrCreatedUser(user));
        },
        [reduxDispatch],
    );

    const actionProps: BulkActionProps = {
        selectedUsers,
        inProgressActionId: state.action?.id,
        onStarted: (actionId, title) =>
            dispatch({ type: 'START', payload: { actionId, title } }),
        onSuccess: handleSucceeded,
        onFailure: (user, error) =>
            dispatch({ type: 'UPDATE_FAILED', payload: { user, error } }),
        onAllCompleted: () => dispatch({ type: 'SHOW_CONFIRMATION' }),
    };

    const handleSummaryClosed = useCallback(() => {
        dispatch({ type: 'END' });
        onResetSelections();
    }, [onResetSelections]);
    return (
        <Container>
            <List>
                <ListItem>
                    <ClearLessonsProgressBulkAction {...actionProps} />
                </ListItem>
                <ListItem>
                    <DeactivateBulkAction {...actionProps} />
                </ListItem>
                <ListItem>
                    <ActivateBulkAction {...actionProps} />
                </ListItem>
            </List>
            <CompletedSummary
                title={state.action?.title}
                show={!!state.showCompletionConfirmation}
                onClose={handleSummaryClosed}
                succeeded={state.succeeded}
                failed={state.failed}
            />
        </Container>
    );
};
