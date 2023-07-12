import { FieldProps, useField } from 'formik';
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';

import { BootstrapField, Select } from '../../../atomic-ui';
import { useCanHaveRole } from '../../../hooks';
import { currentUserRolesSelector } from '../../../selectors';
import { Role, roleIncludesRole } from '../../../utils';
import { LEARNER_LEVEL_DEFAULT } from '../constants';
import { UserValues } from './userFormModel';

const LEADER_OR_ABOVE_DEFAULT_LEARNER_LEVEL = 20;

export const UserForm: React.FC = () => {
    const roles = useSelector(currentUserRolesSelector);
    const [levelField, , levelHelpers] = useField('learnerLevel');
    const [, , roleHelpers] = useField('role');
    const canHaveRole = useCanHaveRole();

    // default value for learnerLevel is
    const handleRoleChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const selectedRole = e.target.value as Role;
            roleHelpers.setValue(selectedRole);
            if (
                roleIncludesRole(selectedRole, Role.leader) &&
                levelField.value <= LEARNER_LEVEL_DEFAULT
            ) {
                levelHelpers.setValue(LEADER_OR_ABOVE_DEFAULT_LEARNER_LEVEL);
            }
        },
        [levelField.value, levelHelpers, roleHelpers],
    );

    return (
        <>
            <BootstrapField
                type="text"
                name="name"
                label="Name"
                placeholder="Enter name"
                required
                autoFocus
            />
            <BootstrapField
                type="email"
                name="email"
                label="Email"
                placeholder="Enter email"
                required
            />
            <BootstrapField name="role" label="Role" required>
                {(props: FieldProps<'role', UserValues>) => (
                    <Select {...(props as any)} onChange={handleRoleChange}>
                        {roles.map((role) => (
                            <option key={role} value={role}>
                                {role}
                            </option>
                        ))}
                    </Select>
                )}
            </BootstrapField>
            {canHaveRole(Role.su) && (
                <BootstrapField
                    type="number"
                    name="learnerLevel"
                    label="Learner Level"
                    required
                />
            )}
        </>
    );
};
