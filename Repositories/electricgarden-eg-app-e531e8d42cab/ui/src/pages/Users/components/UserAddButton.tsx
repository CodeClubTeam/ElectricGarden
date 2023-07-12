import React, { useState } from 'react';

import { Button } from '../../../atomic-ui';
import { UserAdd } from './UserAdd';

export const UserAddButton = () => {
    const [adding, setAdding] = useState(false);
    return (
        <>
            <Button onClick={() => setAdding(true)}>add new user</Button>
            <UserAdd show={adding} onClose={() => setAdding(false)} />
        </>
    );
};
