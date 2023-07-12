import { IPageManifest } from './types';
import { manifest as users } from './Users';
import { manifest as organisations } from './Organisation';
import { manifest as hardware } from './Hardware';
import { manifest as teams } from './Teams';

const manifests: IPageManifest[] = [users, organisations, hardware, teams];

export const initPages: Required<IPageManifest>['init'] = (store) => {
    for (const { init } of manifests) {
        if (init) {
            init(store);
        }
    }
};

export const setCurrentPagesOrganisation: Required<
    IPageManifest
>['setOrganisation'] = (store, orgId?) => {
    for (const { setOrganisation } of manifests) {
        if (setOrganisation) {
            setOrganisation(store, orgId);
        }
    }
};
