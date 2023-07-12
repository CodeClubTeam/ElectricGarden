import React from 'react';
import { Icon } from 'react-fa';
import { Button } from 'react-bootstrap';

export const SubmitButton: React.FC<{
    submitting: boolean;
    title?: string;
    children?: React.ReactChild;
}> = ({ title, submitting, children }) => (
    <Button bsStyle="primary" type="submit" title={title} disabled={submitting}>
        {submitting ? (
            <>
                <Icon name="spinner" spin /> Submitting...
            </>
        ) : (
            children || 'submit'
        )}
    </Button>
);
