import React from 'react';
import { PageContent, PageHeader } from '../../../../atomic-ui';
import { useCanHaveRole } from '../../../../hooks';
import { Role } from '../../../../utils';
import { NoTeamCanCreate } from './NoTeamCanCreate';
import { NoTeamCannotCreate } from './NoTeamCannotCreate';

export const NotInTeam: React.FC = () => {
    const canHaveRole = useCanHaveRole();
    const canAddTeam = canHaveRole(Role.leader);
    return (
        <>
            <PageHeader>
                <h1>Our Garden</h1>
            </PageHeader>
            <PageContent>
                <section>
                    {canAddTeam && <NoTeamCanCreate />}
                    {!canAddTeam && <NoTeamCannotCreate />}
                </section>
            </PageContent>
        </>
    );
};
