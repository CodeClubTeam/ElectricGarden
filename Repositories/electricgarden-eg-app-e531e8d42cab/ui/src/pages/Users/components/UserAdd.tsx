import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ModalFormCreate, ModalProps } from '../../../atomic-ui';
import { useFormSubmitHandler } from '../../../hooks/useFormSubmitHandler';
import { Role, Status } from '../../../utils';
import * as actions from '../actions';
import { UserForm } from './UserForm';
import { UserValues } from './userFormModel';
import { userValidationSchema } from './userValidationSchema';
import { useCanHaveRole } from '../../../hooks';
import { LEARNER_LEVEL_DEFAULT } from '../constants';
import { rolesSelector } from '../../../selectors';

const AddUserModalForm = ModalFormCreate<UserValues>('Add User');

interface UserAddProps extends ModalProps {}

export const UserAdd: React.FC<UserAddProps> = ({ show, onClose }) => {
    const dispatch = useDispatch();
    const [firstAdmin, setFirstAdmin] = useState(false);
    const roles = useSelector(rolesSelector);

    const canHaveRole = useCanHaveRole();

    const handleSubmit = useFormSubmitHandler<UserValues, ServerUser>(
        ({ name, email, role, learnerLevel }, api) =>
            api.user.create({
                name,
                email,
                role,
                learnerLevel,
                status: Status.active,
                firstAdmin: (role === 'admin' && !!firstAdmin) || undefined,
            }),
        {
            onSuccess: (savedUser) => {
                dispatch(actions.updatedOrCreatedUser(savedUser));
                setFirstAdmin(false);
                onClose();
            },
        },
    );

    return (
        <AddUserModalForm
            modalConfig={{ show, onClose }}
            formikConfig={{
                initialValues: {
                    name: '',
                    email: '',
                    learnerLevel: LEARNER_LEVEL_DEFAULT,
                    role: roles[0],
                },
                validationSchema: userValidationSchema,
                onSubmit: handleSubmit,
                render: (form) => (
                    <div>
                        <UserForm />
                        {canHaveRole(Role.su) &&
                            form.values.role === Role.admin && (
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={firstAdmin}
                                        onChange={(e) =>
                                            setFirstAdmin(e.target.checked)
                                        }
                                    />{' '}
                                    Send First Admin Email
                                </label>
                            )}
                    </div>
                ),
            }}
        />
    );
};
