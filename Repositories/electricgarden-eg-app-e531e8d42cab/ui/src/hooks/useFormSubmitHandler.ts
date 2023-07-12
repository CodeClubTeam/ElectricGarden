import { useApi } from '../data/ApiProvider';
import { useCallback } from 'react';
import { FormikHelpers } from 'formik';
import { ApiServer } from '../data/server';

interface Options<TResult = void> {
    onSuccess?: (result: TResult) => void;
}

export const useFormSubmitHandler = <TValues extends {}, TResult = void>(
    save: (values: TValues, api: ApiServer) => Promise<TResult>,
    { onSuccess }: Options<TResult> = {},
) => {
    const api = useApi();
    const handler = useCallback(
        async (values: TValues, formActions: FormikHelpers<TValues>) => {
            try {
                const result = await save(values, api);
                formActions.setSubmitting(false);
                formActions.resetForm();
                if (onSuccess) {
                    // do this last in case onSuccess forces an unmount (e.g. redirect)
                    // which would cause unmounted setstate warnings from react
                    onSuccess(result);
                }
            } catch {
                formActions.setSubmitting(false);
            }
        },
        [api, onSuccess, save],
    );

    return handler;
};
