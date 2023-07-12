import { Field, Formik } from 'formik';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';

import { BootstrapField, FieldValidationError } from '../../../atomic-ui';
import {
    PageHeader,
    Section,
    SubmitButton,
    UserTags,
} from '../../../components/common';
import { useFormSubmitHandler } from '../../../hooks/useFormSubmitHandler';
import * as actions from '../actions';
import { teamEditSelectorCreate, teamForIdSelectorCreate } from '../selectors';
import { teamValidationSchema } from './validationSchemas';

interface Props extends RouteComponentProps<{ teamId: string }> {}

interface FormValues {
    name: string;
    leaderUserIds: string[];
    memberUserIds: string[];
}

export const TeamEdit: React.FC<Props> = ({
    match: {
        url,
        params: { teamId },
    },
    history,
}) => {
    const team = useSelector(
        teamEditSelectorCreate(teamForIdSelectorCreate(teamId)),
    );

    const dispatch = useDispatch();

    const handleSubmit = useFormSubmitHandler<FormValues, ServerTeam>(
        ({ name, leaderUserIds, memberUserIds }, api) => {
            const memberships: TeamMembership[] = [
                ...leaderUserIds.map((userId) => ({
                    userId: userId,
                    role: 'leader' as const,
                })),
                ...memberUserIds.map((userId) => ({
                    userId: userId,
                    role: 'member' as const,
                })),
            ];
            return api.team.update({
                id: teamId,
                name: name,
                memberships,
            });
        },
        {
            onSuccess: (savedTeam) => {
                dispatch(actions.updatedOrCreatedTeam(savedTeam));
                history.push('../');
            },
        },
    );

    if (!team) {
        return <div>Team not found.</div>;
    }

    const initialValues: FormValues = {
        name: team.name,
        leaderUserIds: team.leaderUserIds,
        memberUserIds: team.memberUserIds,
    };
    return (
        <Formik<FormValues>
            initialValues={initialValues}
            validationSchema={teamValidationSchema}
            onSubmit={handleSubmit}
        >
            {(props) => (
                <form onSubmit={props.handleSubmit}>
                    <PageHeader>
                        <div style={{ display: 'flex' }}>
                            <h2>{team.name}</h2>
                            <div className="filler"></div>
                            <Link to={`${url.replace(/\/edit$/, '/')}`}>
                                Back
                            </Link>
                            <SubmitButton
                                submitting={props.isSubmitting}
                                disabled={!props.isValid}
                            >
                                Save
                            </SubmitButton>
                        </div>
                    </PageHeader>

                    <Section header="Details">
                        <BootstrapField
                            id="teamName"
                            type="text"
                            name="name"
                            label="Name"
                            placeholder="Enter name"
                            required
                            autoFocus
                        />
                        <FieldValidationError name="name" form={props} />
                        <hr />
                        <label htmlFor="leaderUserIds">Leaders</label>
                        <Field name="leaderUserIds" component={UserTags} />
                        <FieldValidationError
                            name="leaderUserIds"
                            form={props}
                        />
                        <hr />
                        <label htmlFor="memberUserIds">Members</label>
                        <Field name="memberUserIds" component={UserTags} />
                        <FieldValidationError
                            name="memberUserIds"
                            form={props}
                        />
                    </Section>
                </form>
            )}
        </Formik>
    );
};
