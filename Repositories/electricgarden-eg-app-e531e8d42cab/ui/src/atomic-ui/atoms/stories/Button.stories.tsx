import React from 'react';
import { action } from '@storybook/addon-actions';
import { Button } from '../';

export const primary = () => (
    <Button onClick={action('clicked')}>Primary</Button>
);

export const secondary = () => (
    <Button secondary onClick={action('clicked')}>
        Secondary
    </Button>
);

export const danger = () => (
    <Button danger onClick={action('clicked')}>
        Danger
    </Button>
);

export const size1x = () => (
    <Button size="1x" onClick={action('clicked')}>
        Size 1x
    </Button>
);

export const size2x = () => (
    <Button size="2x" onClick={action('clicked')}>
        Size 2x
    </Button>
);

export default {
    component: Button,
    title: 'Button',
};
