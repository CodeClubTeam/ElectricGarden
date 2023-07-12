import { useState } from 'react';
import styled from 'styled-components/macro';

import { useCanHaveRole } from '../../../hooks';
import { Role } from '../../../utils';
import { CsvImport } from './CsvImport';
import { ImportToggle } from './ImportToggle';
import usersIcon from '../../../static/fauser.svg';
import { UserAddButton } from './UserAddButton';
import { UserImportError } from './UserImportError';
import { ImportFail } from './useUsersCsvImporter';

const Container = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
`;

const HeadingContainer = styled.div`
    flex: 1;
`;

export const UsersHeader = () => {
    const [mode, setMode] = useState<'view' | 'import'>('view');
    const [show, setShow] = useState(false);
    const [fails, setFails] = useState<ImportFail[]>([]);
    const canHaveRole = useCanHaveRole();

    const handleSuccess = (fails: ImportFail[]) => {
        if (fails.length !== 0) {
            setFails(fails);
            setShow(true);
        }
        setMode('view');
    };

    const onClose = () => {
        setFails([]);
        setShow(false);
    };

    return (
        <Container>
            <HeadingContainer>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                    }}
                >
                    <img
                        style={{ margin: '-5px -5px 0 0' }}
                        src={usersIcon}
                        alt={'Users'}
                    />
                    <h2>{mode === 'import' ? 'Add new user' : 'Users'}</h2>
                    {mode === 'import' ? (
                        <CsvImport onSuccess={handleSuccess} />
                    ) : (
                        <div className="filler"></div>
                    )}
                    {show && (
                        <UserImportError fails={fails} onClose={onClose} />
                    )}
                </div>
            </HeadingContainer>
            {canHaveRole(Role.leader) && (
                <ImportToggle
                    on={mode === 'import'}
                    onToggle={() =>
                        setMode(mode === 'view' ? 'import' : 'view')
                    }
                >
                    <UserAddButton />
                </ImportToggle>
            )}
        </Container>
    );
};
