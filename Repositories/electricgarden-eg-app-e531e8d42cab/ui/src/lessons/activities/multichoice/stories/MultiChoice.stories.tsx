import { addDecorator } from '@storybook/react';
import React from 'react';

import { MultiChoiceActivity } from '../';
import { ActivityCompletionContextProvider } from '../../../../pages/Lessons/components/content/ActivityCompletion';

export const singleSelect = () => (
    <MultiChoiceActivity
        question="How are you?"
        choices={[
            {
                label: 'Fine',
                correct: true,
                feedback: 'And I hope the weather is too.',
            },
            { label: 'Bord', feedback: 'And you cant even spell' },
            {
                label:
                    'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters',
            },
        ]}
    />
);

export const multiSelect = () => (
    <MultiChoiceActivity
        question="Which are the dominant smart phone operating systems?"
        choices={[
            { label: 'Windows' },
            { label: 'iOS', correct: true },
            { label: 'WebOS' },
            { label: 'Linux' },
            { label: 'Android', correct: true },
        ]}
        feedback={{
            allCorrect: 'Right you are!',
            someCorrect: 'At least one right!',
            noneCorrect: 'Nope, start over!',
            notEnough: 'Any more?',
            tooMany:
                'You selected all of the right ones but chose some more that are wrong.',
        }}
        submitLabel="Lock it in, Eddie!"
    />
);

addDecorator((storyFn) => (
    <ActivityCompletionContextProvider>
        {storyFn()}
    </ActivityCompletionContextProvider>
));
export default {
    component: MultiChoiceActivity,
    title: 'MultiChoiceActivity',
};
