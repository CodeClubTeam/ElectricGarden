import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

import { Button } from '../../atomic-ui';

export const SubmitButton: React.FC<{
    submitting: boolean;
    title?: string;
    disabled?: boolean;
    children?: React.ReactChild;
}> = ({ title, submitting, disabled, children }) => (
    <Button type="submit" title={title} disabled={disabled || submitting}>
        {submitting ? (
            <>
                <FontAwesomeIcon icon={faSpinner} spin /> Submitting...
            </>
        ) : (
            children || 'submit'
        )}
    </Button>
);
