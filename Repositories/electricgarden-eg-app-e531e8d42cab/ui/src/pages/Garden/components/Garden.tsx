import React from 'react';
import { Route, Redirect } from 'react-router';
import { useRouteMatch } from 'react-router-dom';

import { PageContent, PageFooter, PageHeader } from '../../../atomic-ui';
import { useDefaultGrowableId } from '../hooks';
import { GardenHeader } from './GardenHeader';
import { ensureGrowablesFetched } from './growables/ensureGrowablesFetched';
import { Growable } from './growables/Growable';
import { GrowableNavigation } from './growables/GrowableNavigation';
import { GrowablesIntro } from './prompts/GrowablesIntro';

const Component: React.FC = () => {
    const { path } = useRouteMatch();
    const defaultGrowableId = useDefaultGrowableId();
    return (
        <>
            <PageHeader>
                <GardenHeader />
            </PageHeader>
            <PageContent>
                <nav>
                    <Route
                        path={`${path}/:growableId`}
                        component={GrowableNavigation}
                    />
                </nav>
                <section>
                    <Route path={`${path}/:growableId`} component={Growable} />
                    {defaultGrowableId && (
                        <Route exact path={`${path}/`}>
                            <Redirect to={`${path}/${defaultGrowableId}`} />
                        </Route>
                    )}
                    {!defaultGrowableId && (
                        <Route
                            exact
                            path={`${path}/`}
                            component={GrowablesIntro}
                        />
                    )}
                </section>
            </PageContent>
            <PageFooter />
        </>
    );
};

export const Garden = ensureGrowablesFetched(Component);
