import { Dispatch } from 'redux';

export type SetOrganisation = (
    store: { dispatch: Dispatch },
    orgId: string | undefined,
) => void;

export interface IPageManifest {
    init?: (store: { dispatch: Dispatch }) => void;
    setOrganisation?: SetOrganisation;
}
