import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

import { Button, ButtonProps } from './Button';

export const SubmitButton: React.FC<
    {
        submitting: boolean;
        title?: string;
        children?: React.ReactChild;
        component?: React.ComponentType<ButtonProps>;
    } & ButtonProps
> = ({
    title,
    submitting,
    disabled,
    children,
    component: Component = Button,
    ...props
}) => (
    <Component
        type="submit"
        title={title}
        disabled={disabled || submitting}
        {...props}
    >
        {submitting ? (
            <>
                <FontAwesomeIcon icon={faSpinner} spin /> Submitting...
            </>
        ) : (
            children || 'submit'
        )}
    </Component>
);
