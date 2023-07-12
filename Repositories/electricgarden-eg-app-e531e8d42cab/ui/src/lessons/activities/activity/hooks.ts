import { useActivityDispatch, useActivityState } from './state';

export const useActivityMarker = () => {
    const dispatch = useActivityDispatch();

    return {
        pass: (feedback?: string) =>
            dispatch({ type: 'PASS', payload: { feedback } }),
        fail: (feedback?: string) =>
            dispatch({ type: 'FAIL', payload: { feedback } }),
    };
};

export const useActivityStatus = () => {
    const { result } = useActivityState();
    return {
        locked: !!result,
    };
};
