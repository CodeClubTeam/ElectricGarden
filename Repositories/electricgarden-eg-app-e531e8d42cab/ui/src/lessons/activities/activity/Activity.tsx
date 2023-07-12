import React, { useEffect, useReducer, useRef } from 'react';
import styled from 'styled-components/macro';
import shortid from 'shortid';

import { useActivityRegistrar } from '../../../pages/Lessons/components/content/ActivityCompletion';
import { activityReducer, ActivityContext } from './state';
import { ActivityResult } from './ActivityResult';

export type Tag = string;

export type ActivityProps = {
    tags?: Tag[];
};

const Container = styled.div`
    padding: 1em 0 1em 0;
    margin: 0 auto;
`;

export const Activity: React.FC<ActivityProps> = ({ children }) => {
    const idRef = useRef<string>();
    if (idRef.current === undefined) {
        idRef.current = shortid();
    }
    const { register, pass } = useActivityRegistrar();
    const [state, dispatch] = useReducer(activityReducer, {});
    const result = state.result;
    const id = idRef.current;

    useEffect(() => {
        return register(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (result && result.pass && id) {
            pass(id);
        }
    }, [id, pass, result]);

    return (
        <ActivityContext.Provider value={{ dispatch, state, id }}>
            <Container>
                {children}
                {result && (
                    <ActivityResult
                        {...result}
                        onRetry={() => dispatch({ type: 'RETRY' })}
                    />
                )}
            </Container>
        </ActivityContext.Provider>
    );
};
