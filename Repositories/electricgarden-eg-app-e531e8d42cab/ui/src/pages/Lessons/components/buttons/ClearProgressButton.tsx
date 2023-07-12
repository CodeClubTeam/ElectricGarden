import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '../../../../atomic-ui';
import { useClearLessonsProgress } from '../hooks';

export const ClearProgressButton: React.FC = () => {
    const history = useHistory();
    const resetProgress = useClearLessonsProgress();
    const resetHandler = async () => {
        await resetProgress();
        history.push('/projects');
    };
    return <Button onClick={resetHandler}>Clear Progress</Button>;
};
