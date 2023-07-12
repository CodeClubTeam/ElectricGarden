import {
    currentOrganisationIdSelector,
    currentOrganisationIdOrUndefinedSelector,
    currentOrganisationModeOrUndefinedSelector,
} from '../selectors';
import { useSelector } from 'react-redux';

export const useCurrentOrganisationId = () => {
    const currentOrganisationId = useSelector(currentOrganisationIdSelector);
    return currentOrganisationId;
};

export const useCurrentOrganisationIdOrUndefined = () => {
    const currentOrganisationId = useSelector(
        currentOrganisationIdOrUndefinedSelector,
    );
    return currentOrganisationId;
};

export const useCurrentOrganisationMode = () => {
    return useSelector(currentOrganisationModeOrUndefinedSelector);
};
